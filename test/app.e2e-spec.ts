import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/error/all-exception.filter';
import { INestApplication, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const nestAppOptions: NestApplicationOptions = { logger: ['error', 'warn', 'log', 'debug', 'verbose'] };
    app = module.createNestApplication(nestAppOptions);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('(GET) /health', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('success');
  });
});
