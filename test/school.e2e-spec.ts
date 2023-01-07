import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/error/all-exception.filter';
import { Area } from '@/school/area.enum';
import { School } from '@/school/entities/school.entity';
import { User } from '@/user/entities/user.entity';
import { Role } from '@/user/role.enum';
import { INestApplication, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('SchoolController (e2e)', () => {
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
    const users = await dataSource.getRepository(User).save([
      { name: 'kero', role: Role.ADMIN },
      { name: 'giro', role: Role.STUDENT },
    ]);

    const userId = users[0].id
    await dataSource.getRepository(School).save([
      { name: '고등학교01', area: Area.SEOUL, userId },
      { name: '고등학교02', area: Area.GYEONGGI, userId },
      { name: '고등학교03', area: Area.BUSAN, userId },
      { name: '고등학교04', area: Area.CHUNGCHEONGBUK, userId },
      { name: '고등학교05', area: Area.CHUNGCHEONGNAM, userId },
      { name: '고등학교06', area: Area.DAEGU, userId },
      { name: '고등학교07', area: Area.DAEJEON, userId },
      { name: '고등학교08', area: Area.GANGWON, userId },
      { name: '고등학교09', area: Area.GWANGJU, userId },
      { name: '고등학교10', area: Area.INCHEON, userId },
      { name: '고등학교11', area: Area.JEJU, userId },
    ]);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM school')
    await dataSource.query('DELETE FROM user')
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /school', () => {
    test('성공 201', async () => {
      const user = (await dataSource.getRepository(User).find({ take: 1 }))[0]
      const { body } = await request(app.getHttpServer())
        .post('/school')
        .set('Accept', 'application/json')
        .send({ name: '성남고등학교', area: Area.GYEONGGI, userId: user.id })
        .expect(201);
      
      const expectedSchool = await dataSource.getRepository(School).findOneBy({ name: '성남고등학교' });
      expect(body).toMatchObject(JSON.parse(JSON.stringify(expectedSchool)))
    });
  
    test('실패 422: 이미 생성된 이름으로 생성', async () => {
      const user = (await dataSource.getRepository(User).find({ take: 1 }))[0]
      const { body } = await request(app.getHttpServer())
        .post('/school')
        .set('Accept', 'application/json')
        .send({ name: '고등학교01', area: 'GYEONGGI', userId: user.id })
        .expect(422);

      const expectedBody = { message: 'name: 고등학교01 |name이 같은 school이 이미 존재합니다.' };
      expect(body).toEqual(expectedBody);
    });

    it('실패 400: 잘못된 body값으로 요청', async () => {
      const user = (await dataSource.getRepository(User).find({ take: 1 }))[0]
      const { body } = await request(app.getHttpServer())
        .post('/school')
        .set('Accept', 'application/json')
        .send({ name: 123, area: 'Seoul', userId: user.id })
        .expect(400);

      const expectedBody = { message: 'Bad Request Exception' };
      expect(body).toEqual(expectedBody)
    });
  });
  
  describe('(GET) /school', () => {
    test.each([
      {
        query: { page: '2', pageSize: '3' },
        expectedBody: [
          { name: '고등학교04', area: 'CHUNGCHEONGBUK' },
          { name: '고등학교05', area: 'CHUNGCHEONGNAM' },
          { name: '고등학교06', area: 'DAEGU' }
        ]
      },
      {
        query: { page: '1' },
        expectedBody: [
          { name: '고등학교01', area: Area.SEOUL },
          { name: '고등학교02', area: Area.GYEONGGI },
          { name: '고등학교03', area: Area.BUSAN },
          { name: '고등학교04', area: Area.CHUNGCHEONGBUK },
          { name: '고등학교05', area: Area.CHUNGCHEONGNAM },
          { name: '고등학교06', area: Area.DAEGU },
          { name: '고등학교07', area: Area.DAEJEON },
          { name: '고등학교08', area: Area.GANGWON },
          { name: '고등학교09', area: Area.GWANGJU },
          { name: '고등학교10', area: Area.INCHEON },
        ]
      },
      {
        query: { pageSize: '2' },
        expectedBody: [
          { name: '고등학교01', area: Area.SEOUL },
          { name: '고등학교02', area: Area.GYEONGGI },
        ]
      },
    ])('성공 200 query: $query', async ({ query, expectedBody }) => {
      const { body } = await request(app.getHttpServer())
        .get('/school')
        .set('Accept', 'application/json')
        .query(query)
        .expect(200);
      expect(body).toMatchObject(expectedBody)
    })
  
    test('실패 404: 없는 id로 학교를 조회', async () => {
      const school = (await dataSource.getRepository(School).find({ order: { id: 'DESC' }, take: 1 }))[0];
      const { body } = await request(app.getHttpServer())
        .get(`/school/${school.id + 1}`)
        .set('Accept', 'application/json')
        .expect(404);

      const expectedBody = { message: `id: ${school.id + 1} |해당 id의 school이 존재하지 않습니다.` };
      expect(body).toEqual(expectedBody);
    });
  });
  
  describe('GET /school/:id', () => {
    it('성공 200', async () => {
      const expectedSchool = await dataSource.getRepository(School).findOne({ where: { name: '고등학교01'} });
      const { body } = await request(app.getHttpServer())
        .get(`/school/${expectedSchool.id}`)
        .set('Accept', 'application/json')
        .expect(200);
        
      expect(body).toEqual(JSON.parse(JSON.stringify(expectedSchool)));
    });

    it('실패 404: 없는 id 값으로 조회', async () => {
      const school = (await dataSource.getRepository(School).find({ order: { id: 'DESC' }, take: 1 }))[0]
      const { body } = await request(app.getHttpServer())
        .get(`/school/${school.id + 1}`)
        .set('Accept', 'application/json')
        .expect(404);

      expect(body).toEqual({ 'message': `id: ${school.id + 1} |해당 id의 school이 존재하지 않습니다.` });
    });
  });

  describe('PATCH /school/:id', () => {
    it('성공 200', async () => {
      const originalSchool = await dataSource.getRepository(School).findOneBy({ name: '고등학교01' });
      await request(app.getHttpServer())
        .patch(`/school/${originalSchool.id}`)
        .set('Accept', 'application/json')
        .send({ name: '성남고등학교' })
        .expect(200);
      
      const expectedSchool = await dataSource.getRepository(School).findOneBy({ id: originalSchool.id });
      expect(expectedSchool.name).toBe('성남고등학교');
    });

    it('실패 400: body에 값을 잘못 전달', async () => {
      const originalSchool = await dataSource.getRepository(School).findOne({ where: { name: '고등학교01'} });
      const { body } = await request(app.getHttpServer())
        .patch(`/school/${originalSchool.id}`)
        .set('Accept', 'application/json')
        .send({ area: 'seoul' })
        .expect(400);

      expect(body).toEqual({ message: 'Bad Request Exception' });
      const expectedSchool = await dataSource.getRepository(School).findOneBy({ id: originalSchool.id });
      expect(expectedSchool.name).toBe('고등학교01');
    });

    it('실패 404: 없는 id에 대해 수정 요청', async () => {
      const school = (await dataSource.getRepository(School).find({ order: { id: 'DESC' }, take: 1 }))[0];
      const { body } = await request(app.getHttpServer())
        .patch(`/school/${school.id + 1}`)
        .set('Accept', 'application/json')
        .send({ name: '성남고등학교' })
        .expect(404);
        
      expect(body).toEqual({ 'message': `id: ${school.id + 1} |해당 id의 school이 존재하지 않습니다.` });
      const expectedSchool = await dataSource.getRepository(School).findOneBy({ id: school.id });
      expect(expectedSchool.name).toBe(school.name);
    });

    it('실패 422: 이미생성된(선점된) 이름으로 변경 요청', async () => {
      const school = await dataSource.getRepository(School).findOneBy({ name: '고등학교01' });
      const { body } = await request(app.getHttpServer())
        .patch(`/school/${school.id}`)
        .set('Accept', 'application/json')
        .send({ name: '고등학교02' })
        .expect(422);

      expect(body).toEqual({ 'message': `name: 고등학교02 |name이 같은 school이 이미 존재합니다.` });
      const expectedSchool = await dataSource.getRepository(School).findOneBy({ id: school.id });
      expect(expectedSchool.name).toBe('고등학교01');
    });
  })

  describe('DELETE /school/:id', () => {
    it('성공 200', async () => {
      const originalSchool = await dataSource.getRepository(School).findOneBy({ name: '고등학교01' });
      await request(app.getHttpServer())
        .delete(`/school/${originalSchool.id}`)
        .set('Accept', 'application/json')
        .expect(200);
      
      const expectedSchool = await dataSource.getRepository(School).findOneBy({ name: '고등학교01' });
      expect(expectedSchool).toBe(null);
    });

    it('실패 404: 없는 id에 대한 삭제 요청', async () => {
      const school = (await dataSource.getRepository(School).find({ order: { id: 'DESC' }, take: 1 }))[0];
      const { body } = await request(app.getHttpServer())
        .delete(`/school/${school.id + 1}`)
        .set('Accept', 'application/json')
        .expect(404);

      expect(body).toEqual({ 'message': `id: ${school.id + 1} |해당 id의 school이 존재하지 않습니다.` });
    });
  })
  
});