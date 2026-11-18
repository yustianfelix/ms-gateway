import { BadGatewayException, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

@Injectable()
export class AppService {
  async proxy(
    request: Request,
    response: Response,
    service: 'auth' | 'attendance',
  ): Promise<void> {
    const baseUrl =
      service === 'auth'
        ? (process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001')
        : (process.env.ATTENDANCE_SERVICE_URL ?? 'http://localhost:3002');
    const incomingUrl = new URL(request.originalUrl, 'http://gateway.local');
    const path = incomingUrl.pathname.replace(
      new RegExp(`^/${service}(?=/|$)`),
      '',
    );
    const targetUrl = new URL(
      `${path || '/'}${incomingUrl.search}`,
      `${baseUrl.replace(/\/$/, '')}/`,
    );

    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (value !== undefined && !HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
        headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    let body: BodyInit | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const requestBody: unknown = request.body;
      if (typeof requestBody === 'string') {
        body = requestBody;
      } else if (Buffer.isBuffer(requestBody)) {
        body = Uint8Array.from(requestBody);
      } else if (requestBody !== undefined) {
        body = JSON.stringify(requestBody);
      }
    }

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: 'manual',
      });
    } catch {
      throw new BadGatewayException(`${service} service is unavailable`);
    }

    response.status(upstream.status);
    upstream.headers.forEach((value, name) => {
      if (name !== 'set-cookie' && !HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
        response.setHeader(name, value);
      }
    });
    for (const cookie of upstream.headers.getSetCookie()) {
      response.append('Set-Cookie', cookie);
    }

    if (request.method === 'HEAD' || upstream.status === 204 || upstream.status === 304) {
      response.end();
      return;
    }

    response.end(Buffer.from(await upstream.arrayBuffer()));
  }
}
