import {
  BadGatewayException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as http from 'node:http';
import * as https from 'node:https';
import { URL } from 'node:url';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export interface UpstreamRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  serviceName?: string;
}

export function sendUpstreamRequest<T>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  serviceName?: string;
}): Promise<T> {
  const { method, url, body, headers: incomingHeaders, serviceName = 'Upstream' } = options;

  return new Promise((resolve, reject) => {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return reject(
        new BadGatewayException(`Invalid target URL: ${url}`),
      );
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const bodyPayload = body !== undefined ? JSON.stringify(body) : undefined;

    const requestHeaders: http.OutgoingHttpHeaders = {
      'content-type': 'application/json',
      accept: 'application/json',
    };

    if (incomingHeaders) {
      for (const [key, value] of Object.entries(incomingHeaders)) {
        if (value !== undefined && !HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
          requestHeaders[key] = value;
        }
      }
    }

    if (bodyPayload) {
      requestHeaders['content-length'] = Buffer.byteLength(bodyPayload);
    }

    const req = client.request(
      parsedUrl,
      {
        method,
        headers: requestHeaders,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          let parsedResponse: unknown;
          try {
            parsedResponse = rawBody ? JSON.parse(rawBody) : null;
          } catch {
            parsedResponse = rawBody;
          }

          const statusCode = res.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
          if (statusCode >= 200 && statusCode < 300) {
            resolve(parsedResponse as T);
          } else {
            reject(
              new HttpException(
                (parsedResponse as string | object) ?? `${serviceName} error`,
                statusCode,
              ),
            );
          }
        });
      },
    );

    req.on('error', (error) => {
      reject(
        new BadGatewayException(
          `${serviceName} service is unavailable: ${error.message}`,
        ),
      );
    });

    if (bodyPayload) {
      req.write(bodyPayload);
    }
    req.end();
  });
}
