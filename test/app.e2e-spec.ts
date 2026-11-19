import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Gateway Security & Routing (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Public Endpoints', () => {
    it('/ (GET) should allow public access without a token', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('/auth/login (POST) should be accessible without an authorization token (guard does not block)', async () => {
      // Sending invalid payload returns 400 from ValidationPipe, proving AuthGuard did not block with 401
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).not.toBe(401);
      expect(response.status).toBe(400);
    });
  });

  describe('Protected Endpoints (Global APP_GUARD)', () => {
    it('should reject /employees/1/profile with 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/employees/1/profile')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Authentication token is required');
        });
    });

    it('should reject /employees/1/profile with 401 when an invalid token is provided', () => {
      return request(app.getHttpServer())
        .get('/employees/1/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid or expired authentication token');
        });
    });

    it('should reject /attendance with 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .post('/attendance')
        .send({ employee_id: '1', action: 'clock_in' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Authentication token is required');
        });
    });

    it('should reject /attendance/summary with 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/attendance/summary')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Authentication token is required');
        });
    });

    it('should allow request through the guard when a valid token is provided', async () => {
      const validToken = await jwtService.signAsync(
        { sub: '1', email: 'test@example.com', role: 'employee' },
        { secret: process.env.JWT_SECRET ?? 'defaultSecretKey' },
      );

      const response = await request(app.getHttpServer())
        .get('/employees/1/profile')
        .set('Authorization', `Bearer ${validToken}`);

      // The guard allowed the request through! (Upstream may return 502 BadGateway in test environment, but NOT 401 Unauthorized)
      expect(response.status).not.toBe(401);
    });
  });
});
