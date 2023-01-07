import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/error/all-exception.filter';
import { Area } from '@/school/area.enum';
import { School } from '@/school/entities/school.entity';
import { CreateSubscribeDto } from '@/subscribe/dto/create-subscribe.dto';
import { Subscribe } from '@/subscribe/entities/subscribe.entity';
import { User } from '@/user/entities/user.entity';
import { Role } from '@/user/role.enum';
import { INestApplication, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('SubscribeController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let adminUser: User;
  let studentUsers: User[];
  let maxUserId: number;
  let schools: School[];
  let maxSchoolId: number;
  let subscribeList: Subscribe[];
  
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
      { name: 'zero', role: Role.STUDENT },
      { name: 'hero', role: Role.STUDENT },
    ]);
    adminUser = users[0];
    studentUsers = [users[1], users[2], users[3]];
    maxUserId = users.at(-1).id;
    
    schools = await dataSource.getRepository(School).save([
      { name: '고등학교01', area: Area.SEOUL, userId: adminUser.id },
      { name: '고등학교02', area: Area.GYEONGGI, userId: adminUser.id },
      { name: '고등학교03', area: Area.BUSAN, userId: adminUser.id },
      { name: '고등학교04', area: Area.CHUNGCHEONGBUK, userId: adminUser.id },
      { name: '고등학교05', area: Area.CHUNGCHEONGNAM, userId: adminUser.id },
    ]);
    maxSchoolId = schools.reduce((max, school) => Math.max(max, school.id), 1);

    subscribeList = await dataSource.getRepository(Subscribe).save([
      { userId: studentUsers[0].id, schoolId: schools[0].id, createdAt: new Date('2022-12-30T08:00:00.000Z'), deletedAt: new Date('2022-12-31T10:00:00.000Z') },
      { userId: studentUsers[0].id, schoolId: schools[1].id, createdAt: new Date('2023-01-02T08:00:00.000Z') },
      { userId: studentUsers[1].id, schoolId: schools[2].id, createdAt: new Date('2023-01-02T08:00:00.000Z') },
      { userId: studentUsers[2].id, schoolId: schools[0].id, createdAt: new Date('2023-01-02T08:00:00.000Z'), deletedAt: new Date('2023-01-04T10:00:00.000Z') },
      { userId: studentUsers[2].id, schoolId: schools[1].id, createdAt: new Date('2023-01-02T08:00:00.000Z') },
      { userId: studentUsers[2].id, schoolId: schools[2].id, createdAt: new Date('2023-01-02T08:00:00.000Z'), deletedAt: new Date('2023-01-04T10:00:00.000Z') },
      { userId: studentUsers[2].id, schoolId: schools[3].id, createdAt: new Date('2023-01-02T08:00:00.000Z') },
    ]);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM subscribe')
    await dataSource.query('DELETE FROM school')
    await dataSource.query('DELETE FROM user')
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /subscribe', () => {
    test('성공 201', async () => {
      const requestBody: CreateSubscribeDto = {
        userId: studentUsers.at(-1).id,
        schoolId: schools.at(-1).id
      };
      const { body } = await request(app.getHttpServer())
        .post('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(201);
      
      const expectedSubscribe = await dataSource.getRepository(Subscribe).findOneBy(requestBody);
      expect(body).toMatchObject(JSON.parse(JSON.stringify(expectedSubscribe)));
    });
  
    test('실패 422: 이미 구독중인 경우', async () => {
      const requestBody: CreateSubscribeDto = {
        userId: subscribeList[1].userId,
        schoolId: subscribeList[1].schoolId,
      };
      const { body } = await request(app.getHttpServer())
        .post('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(422);
      
      const expectedBody = { message: `userId: ${requestBody.userId} |schoolId: ${requestBody.schoolId} |userId의 사용자는 이미 schoolId의 학교를 구독중에 있습니다.` }
      expect(body).toMatchObject(expectedBody);
    });

    test('실패 404: 존재하지 않는 userId로 생성', async () => {
      const requestBody: CreateSubscribeDto = {
        userId: maxUserId + 1,
        schoolId: maxSchoolId,
      };
      const { body } = await request(app.getHttpServer())
        .post('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(404);
      
      const expectedBody = { message: `id: ${requestBody.userId} |해당 id의 user가 존재하지 않습니다.` }
      expect(body).toMatchObject(expectedBody);
    });

    test('실패 404: 존재하지 않는 schoolId로 생성', async () => {
      const requestBody: CreateSubscribeDto = {
        userId: maxUserId,
        schoolId: maxSchoolId + 1,
      };
      const { body } = await request(app.getHttpServer())
        .post('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(404);
      
      const expectedBody = { message: `id: ${requestBody.schoolId} |해당 id의 school이 존재하지 않습니다.` }
      expect(body).toMatchObject(expectedBody);
    });

    it('실패 400: 잘못된 body값으로 요청', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/subscribe')
        .set('Accept', 'application/json')
        .send({ userId: '123', schoolId: undefined })
        .expect(400);

      const expectedBody = { message: 'Bad Request Exception' };
      expect(body).toEqual(expectedBody)
    });
  });
  
  describe('(GET) /subscribe', () => {
    describe('성공 200', () => {
      it('1개 구독, 1개 구독후 삭제 -> 1개 구독만 조회', async () => {
        const requestBody = { userId: `${studentUsers[0].id}`, page: '1', pageSize: '99' };
        const expectedResponseBody = JSON.parse(JSON.stringify([subscribeList[1]]));
        const { body } = await request(app.getHttpServer())
          .get('/subscribe')
          .set('Accept', 'application/json')
          .query(requestBody)
          .expect(200);

        expect(body.length).toBe(expectedResponseBody.length);
        expect(body).toMatchObject(expectedResponseBody)
      })

      it('1개 구독 -> 1개 구독 조회', async () => {
        const requestBody = { userId: `${studentUsers[1].id}`, page: '1', pageSize: '99' };
        const expectedResponseBody = JSON.parse(JSON.stringify([subscribeList[2]]));
        const { body } = await request(app.getHttpServer())
          .get('/subscribe')
          .set('Accept', 'application/json')
          .query(requestBody)
          .expect(200);
        
        expect(body.length).toBe(expectedResponseBody.length);
        expect(body).toMatchObject(expectedResponseBody)
      })

      it('2개 구독, 2개 구독 후 취소 -> 2개 구독만 조회', async () => {
        const requestBody = { userId: `${studentUsers[2].id}`, page: '1', pageSize: '99' };
        const expectedResponseBody = JSON.parse(JSON.stringify([subscribeList[4], subscribeList[6]]));
        const { body } = await request(app.getHttpServer())
          .get('/subscribe')
          .set('Accept', 'application/json')
          .query(requestBody)
          .expect(200);
        
        expect(body.length).toBe(expectedResponseBody.length);
        expect(body).toMatchObject(expectedResponseBody)
      })
    });

    it('실패 400: 잘못된 값을 query param으로 요청', async () => {
      const requestBody = { userId: `one`, page: '1', pageSize: '99' };
      const { body } = await request(app.getHttpServer())
        .get('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(400);

      const expectedBody = { message: 'Bad Request Exception' };
      expect(body).toEqual(expectedBody)
    });
  });

  describe('DELETE /subscribe/:id', () => {
    it('성공 200', async () => {
      const requestBody: CreateSubscribeDto = {
        userId: subscribeList[1].userId,
        schoolId: subscribeList[1].schoolId,
      };
      await request(app.getHttpServer())
        .delete('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(200);
      
      const expectedSubscribe = await dataSource.getRepository(Subscribe).findOne({
        where: requestBody,
        withDeleted: true
      });
      expect(expectedSubscribe.deletedAt).not.toBe(null);
    });
    
    test('실패 404: 존재하지 않는 구독을 삭제', async () => {
      const requestBody: CreateSubscribeDto = {
        userId: maxUserId,
        schoolId: maxSchoolId,
      };
      const { body } = await request(app.getHttpServer())
        .delete('/subscribe')
        .set('Accept', 'application/json')
        .send(requestBody)
        .expect(404);
      
      const expectedBody = { message: `userId: ${requestBody.userId} |schoolId: ${requestBody.schoolId} |해당하는 구독이 존재하지 않습니다.` }
      expect(body).toMatchObject(expectedBody);
    });

    it('실패 400: 잘못된 body값으로 요청', async () => {
      const { body } = await request(app.getHttpServer())
        .delete('/subscribe')
        .set('Accept', 'application/json')
        .send({ userId: '123', schoolId: undefined })
        .expect(400);

      const expectedBody = { message: 'Bad Request Exception' };
      expect(body).toEqual(expectedBody)
    });
  })
});