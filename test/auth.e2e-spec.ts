import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;
  let user = {
    email: 'email+10@email.com',
    password: 'password',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a sign up request', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: user.email, password: user.password })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(user.email);
      });

    await request(app.getHttpServer()).delete('/22');
  });

  it('signup as a new uesr and get the currently logged in user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: user.email, password: user.password })
      .expect(201);
    const cookie = response.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body).toHaveProperty('email', user.email);
  });
});
