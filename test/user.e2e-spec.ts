import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/error/all-exception.filter';
import { User } from '@/user/entities/user.entity';
import { Role } from '@/user/role.enum';
import { INestApplication, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const nestAppOptions: NestApplicationOptions = { logger: ['error', 'warn', 'log', 'debug', 'verbose'] };
    app = module.createNestApplication(nestAppOptions);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.getRepository(User).save([
      { name: 'kero', role: Role.ADMIN },
      { name: 'giro', role: Role.STUDENT },
    ]);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM user')
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /user', () => {
    it('성공 201', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .set('Accept', 'application/json')
        .send({ name: 'hero', role: 'ADMIN' })
        .expect(201);
      
      const expectedUser = await dataSource.getRepository(User).findOneBy({ name: 'hero', role: Role.ADMIN });
      expect(expectedUser).toBeInstanceOf(User);
    });

    it('실패 400: body에 값을 잘못 전달', async () => {
      const [initUsers, initCount] = await dataSource.getRepository(User).findAndCount();
      const { body } = await request(app.getHttpServer())
        .post('/user')
        .set('Accept', 'application/json')
        .send({ Name: 'kero',role: 'student' })
        .expect(400);

      const [lastUsers, lastCount] = await dataSource.getRepository(User).findAndCount();
      expect(initCount).toBe(lastCount);
      expect(body).toEqual({ message: 'Bad Request Exception' });
    });
  });

  describe('GET /user/:id', () => {
    it('성공 200', async () => {
      const expectedUser = await dataSource.getRepository(User).findOne({ where: { name: 'kero'} });
      const { body } = await request(app.getHttpServer())
        .get(`/user/${expectedUser.id}`)
        .set('Accept', 'application/json')
        .expect(200);
        
      expect(body).toEqual(JSON.parse(JSON.stringify(expectedUser)));
    });

    it('실패 404: 없는 id 값으로 조회', async () => {
      const maxId = (await dataSource.query('select max(id) as maxId from user'))[0].maxId;
      const { body } = await request(app.getHttpServer())
        .get(`/user/${maxId + 1}`)
        .set('Accept', 'application/json')
        .expect(404);

        const lastMaxId = (await dataSource.query('select max(id) as maxId from user'))[0].maxId;
      expect(maxId).toBe(lastMaxId);
      expect(body).toEqual({ 'message': `id: ${maxId + 1} |해당 id의 user가 존재하지 않습니다.` });
    });
  });
  
  describe('PATCH /user/:id', () => {
    it('성공 200', async () => {
      const originalUser = await dataSource.getRepository(User).findOne({ where: { name: 'kero'} });
      await request(app.getHttpServer())
        .patch(`/user/${originalUser.id}`)
        .set('Accept', 'application/json')
        .send({ name: 'hero' })
        .expect(200);
      
      const expectedUser = await dataSource.getRepository(User).findOneBy({ id: originalUser.id });
      expect(expectedUser.name).toBe('hero');
    });

    it('실패 400: body에 값을 잘못 전달', async () => {
      const originalUser = await dataSource.getRepository(User).findOne({ where: { name: 'kero'} });
      const { body } = await request(app.getHttpServer())
        .patch(`/user/${originalUser.id}`)
        .set('Accept', 'application/json')
        .send({ name: 123 })
        .expect(400);

      expect(body).toEqual({ message: 'Bad Request Exception' });
      const expectedUser = await dataSource.getRepository(User).findOneBy({ id: originalUser.id });
      expect(expectedUser.name).toBe('kero');
    });

    it('실패 404: 없는 id에 대해 수정 요청', async () => {
      const maxId = (await dataSource.query('select max(id) as maxId from user'))[0].maxId;
      const user = await dataSource.getRepository(User).findOneBy({ id: maxId });
      const { body } = await request(app.getHttpServer())
        .patch(`/user/${user.id + 1}`)
        .set('Accept', 'application/json')
        .send({ name: 'hero' })
        .expect(404);
        
      expect(body).toEqual({ 'message': `id: ${user.id + 1} |해당 id의 user가 존재하지 않습니다.` });
      const expectedUser = await dataSource.getRepository(User).findOneBy({ id: maxId });
      expect(expectedUser.name).toBe(user.name);
    });
  })

  describe('DELETE /user/:id', () => {
    it('성공 200', async () => {
      const originalUser = await dataSource.getRepository(User).findOne({ where: { name: 'kero'} });
      await request(app.getHttpServer())
        .delete(`/user/${originalUser.id}`)
        .set('Accept', 'application/json')
        .expect(200);
      
      const expectedUser = await dataSource.getRepository(User).findOneBy({ id: originalUser.id });
      expect(expectedUser).toBe(null);
    });

    it('실패 404: 없는 id에 대한 삭제 요청', async () => {
      const maxId = (await dataSource.query('select max(id) as maxId from user'))[0].maxId;
      const { body } = await request(app.getHttpServer())
        .delete(`/user/${maxId + 1}`)
        .set('Accept', 'application/json')
        .expect(404);

      expect(body).toEqual({ 'message': `id: ${maxId + 1} |해당 id의 user가 존재하지 않습니다.` });
    });
  })
});