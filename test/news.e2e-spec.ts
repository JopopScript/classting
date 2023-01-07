import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/error/all-exception.filter';
import { News } from '@/news/entities/news.entity';
import { Area } from '@/school/area.enum';
import { School } from '@/school/entities/school.entity';
import { Subscribe } from '@/subscribe/entities/subscribe.entity';
import { User } from '@/user/entities/user.entity';
import { Role } from '@/user/role.enum';
import { INestApplication, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('NewsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let users: User[];
  let schools: School[];
  let maxSchoolId: number;
  let adminUserId: number;
  let studentUserId: number;
  let newsList: News[];
  
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
    users = await dataSource.getRepository(User).save([
      { name: 'kero', role: Role.ADMIN },
      { name: 'giro', role: Role.STUDENT },
    ]);

    adminUserId = users[0].id
    schools = await dataSource.getRepository(School).save([
      { name: '고등학교01', area: Area.SEOUL, userId: adminUserId },
      { name: '고등학교02', area: Area.GYEONGGI, userId: adminUserId },
      { name: '고등학교03', area: Area.BUSAN, userId: adminUserId },
      { name: '고등학교04', area: Area.CHUNGCHEONGBUK, userId: adminUserId },
      { name: '고등학교05', area: Area.CHUNGCHEONGNAM, userId: adminUserId },
      { name: '고등학교06', area: Area.DAEGU, userId: adminUserId },
      { name: '고등학교07', area: Area.DAEJEON, userId: adminUserId },
      { name: '고등학교08', area: Area.GANGWON, userId: adminUserId },
      { name: '고등학교09', area: Area.GWANGJU, userId: adminUserId },
      { name: '고등학교10', area: Area.INCHEON, userId: adminUserId },
      { name: '고등학교11', area: Area.JEJU, userId: adminUserId },
    ]);
    maxSchoolId = schools.reduce((max, school) => Math.max(max, school.id), 1);

    newsList = await dataSource.getRepository(News).save([
      { title: '공지사항01', contents: '공지내용01', schoolId: schools[0].id, createdAt: new Date('2022-12-29T09:00:00.000Z') },
      { title: '공지사항02', contents: '공지내용02', schoolId: schools[0].id, createdAt: new Date('2022-12-30T09:00:00.000Z') },
      { title: '공지사항03', contents: '공지내용03', schoolId: schools[0].id, createdAt: new Date('2022-12-31T09:00:00.000Z') },
      { title: '공지사항04', contents: '공지내용04', schoolId: schools[0].id, createdAt: new Date('2023-01-01T09:00:00.000Z') },
      { title: '공지사항05', contents: '공지내용05', schoolId: schools[0].id, createdAt: new Date('2023-01-02T11:00:00.000Z') },
      { title: '공지사항06', contents: '공지내용06', schoolId: schools[0].id, createdAt: new Date('2023-01-03T09:00:00.000Z') },
      { title: '공지사항07', contents: '공지내용07', schoolId: schools[0].id, createdAt: new Date('2023-01-04T09:00:00.000Z') },
      { title: '공지사항08', contents: '공지내용08', schoolId: schools[0].id, createdAt: new Date('2023-01-05T09:00:00.000Z') },
      { title: '공지사항09', contents: '공지내용09', schoolId: schools[1].id, createdAt: new Date('2023-01-01T09:00:00.000Z') },
      { title: '공지사항10', contents: '공지내용10', schoolId: schools[1].id, createdAt: new Date('2023-01-02T10:00:00.000Z') },
    ]);

    studentUserId = users[1].id
    await dataSource.getRepository(Subscribe).save([
      { userId: studentUserId, schoolId: schools[0].id, createdAt: new Date('2022-12-30T08:00:00.000Z'), deletedAt: new Date('2022-12-31T10:00:00.000Z') },
      { userId: studentUserId, schoolId: schools[0].id, createdAt: new Date('2023-01-02T08:00:00.000Z') },
      { userId: studentUserId, schoolId: schools[1].id, createdAt: new Date('2023-01-02T08:00:00.000Z') },
    ]);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM subscribe')
    await dataSource.query('DELETE FROM news')
    await dataSource.query('DELETE FROM school')
    await dataSource.query('DELETE FROM user')
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /news', () => {
    test('성공 201', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/news')
        .set('Accept', 'application/json')
        .send({ title: '공지사항', contents: '공지내용', schoolId: schools[2].id })
        .expect(201);
      
      const expectedNews = await dataSource.getRepository(News).findOneBy({ schoolId: schools[2].id });
      expect(body).toMatchObject(JSON.parse(JSON.stringify(expectedNews)))

    });
  
    test('실패 422: 존재하지 않는 schoolId로 생성', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/news')
        .set('Accept', 'application/json')
        .send({ title: '공지사항', contents: '공지내용', schoolId: maxSchoolId + 1 })
        .expect(404);

      const expectedBody = { message: `id: ${maxSchoolId + 1} |해당 id의 school이 존재하지 않습니다.` };
      expect(body).toEqual(expectedBody);
    });

    it('실패 400: 잘못된 body값으로 요청', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/news')
        .set('Accept', 'application/json')
        .send({ title: true, contents: 123, schoolId: 1 })
        .expect(400);

      const expectedBody = { message: 'Bad Request Exception' };
      expect(body).toEqual(expectedBody)
    });
  });
  
  describe('(GET) /news', () => {
    describe('성공 200', () => {
      it('전체 소식 조회', async () => {
        const { body } = await request(app.getHttpServer())
          .get('/news')
          .set('Accept', 'application/json')
          .query({ page: '1', pageSize: '99' })
          .expect(200);
  
        const expectedBody = [
          { title: '공지사항08', contents: '공지내용08', schoolId: schools[0].id, createdAt: new Date('2023-01-05T09:00:00.000Z').toISOString() },
          { title: '공지사항07', contents: '공지내용07', schoolId: schools[0].id, createdAt: new Date('2023-01-04T09:00:00.000Z').toISOString() },
          { title: '공지사항06', contents: '공지내용06', schoolId: schools[0].id, createdAt: new Date('2023-01-03T09:00:00.000Z').toISOString() },
          { title: '공지사항05', contents: '공지내용05', schoolId: schools[0].id, createdAt: new Date('2023-01-02T11:00:00.000Z').toISOString() },
          { title: '공지사항10', contents: '공지내용10', schoolId: schools[1].id, createdAt: new Date('2023-01-02T10:00:00.000Z').toISOString() },
          { title: '공지사항04', contents: '공지내용04', schoolId: schools[0].id, createdAt: new Date('2023-01-01T09:00:00.000Z').toISOString() },
          { title: '공지사항09', contents: '공지내용09', schoolId: schools[1].id, createdAt: new Date('2023-01-01T09:00:00.000Z').toISOString() },
          { title: '공지사항03', contents: '공지내용03', schoolId: schools[0].id, createdAt: new Date('2022-12-31T09:00:00.000Z').toISOString() },
          { title: '공지사항02', contents: '공지내용02', schoolId: schools[0].id, createdAt: new Date('2022-12-30T09:00:00.000Z').toISOString() },
          { title: '공지사항01', contents: '공지내용01', schoolId: schools[0].id, createdAt: new Date('2022-12-29T09:00:00.000Z').toISOString() },
        ]
        expect(body).toMatchObject(expectedBody)
      })

      it('특정사용자가 구독한 모든 학교의 소식 조회', async () => {
        const { body } = await request(app.getHttpServer())
          .get('/news')
          .set('Accept', 'application/json')
          .query({ userId: `${studentUserId}`, page: '1', pageSize: '99' })
          .expect(200);
  
        const expectedBody = [
          { title: '공지사항08', contents: '공지내용08', schoolId: schools[0].id, createdAt: new Date('2023-01-05T09:00:00.000Z').toISOString() },
          { title: '공지사항07', contents: '공지내용07', schoolId: schools[0].id, createdAt: new Date('2023-01-04T09:00:00.000Z').toISOString() },
          { title: '공지사항06', contents: '공지내용06', schoolId: schools[0].id, createdAt: new Date('2023-01-03T09:00:00.000Z').toISOString() },
          { title: '공지사항05', contents: '공지내용05', schoolId: schools[0].id, createdAt: new Date('2023-01-02T11:00:00.000Z').toISOString() },
          { title: '공지사항10', contents: '공지내용10', schoolId: schools[1].id, createdAt: new Date('2023-01-02T10:00:00.000Z').toISOString() },
          { title: '공지사항03', contents: '공지내용03', schoolId: schools[0].id, createdAt: new Date('2022-12-31T09:00:00.000Z').toISOString() },
          { title: '공지사항02', contents: '공지내용02', schoolId: schools[0].id, createdAt: new Date('2022-12-30T09:00:00.000Z').toISOString() },
        ]
        expect(body).toMatchObject(expectedBody)
      })

      it('특정사용자가 구독한 한개 학교의 소식 조회', async () => {
        const { body } = await request(app.getHttpServer())
          .get('/news')
          .set('Accept', 'application/json')
          .query({ userId: `${studentUserId}`, schoolId: `${schools[0].id}`, page: '1', pageSize: '99' })
          .expect(200);
  
        const expectedBody = [
          { title: '공지사항08', contents: '공지내용08', schoolId: schools[0].id, createdAt: new Date('2023-01-05T09:00:00.000Z').toISOString() },
          { title: '공지사항07', contents: '공지내용07', schoolId: schools[0].id, createdAt: new Date('2023-01-04T09:00:00.000Z').toISOString() },
          { title: '공지사항06', contents: '공지내용06', schoolId: schools[0].id, createdAt: new Date('2023-01-03T09:00:00.000Z').toISOString() },
          { title: '공지사항05', contents: '공지내용05', schoolId: schools[0].id, createdAt: new Date('2023-01-02T11:00:00.000Z').toISOString() },
          { title: '공지사항03', contents: '공지내용03', schoolId: schools[0].id, createdAt: new Date('2022-12-31T09:00:00.000Z').toISOString() },
          { title: '공지사항02', contents: '공지내용02', schoolId: schools[0].id, createdAt: new Date('2022-12-30T09:00:00.000Z').toISOString() },
        ]
        expect(body).toMatchObject(expectedBody)
      })

      it('특정사용자가 구독한 한개 학교의 소식 중 첫페이지 몇개만 조회', async () => {
        const { body } = await request(app.getHttpServer())
          .get('/news')
          .set('Accept', 'application/json')
          .query({ userId: `${studentUserId}`, schoolId: `${schools[0].id}`, page: '1', pageSize: '3' })
          .expect(200);
  
        const expectedBody = [
          { title: '공지사항08', contents: '공지내용08', schoolId: schools[0].id, createdAt: new Date('2023-01-05T09:00:00.000Z').toISOString() },
          { title: '공지사항07', contents: '공지내용07', schoolId: schools[0].id, createdAt: new Date('2023-01-04T09:00:00.000Z').toISOString() },
          { title: '공지사항06', contents: '공지내용06', schoolId: schools[0].id, createdAt: new Date('2023-01-03T09:00:00.000Z').toISOString() },
        ]
        expect(body).toMatchObject(expectedBody)
      })
    });
  });

  describe('GET /news/:id', () => {
    it('성공 200', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/news/${newsList[0].id}`)
        .set('Accept', 'application/json')
        .expect(200);
      
      expect(body).toMatchObject(JSON.parse(JSON.stringify(newsList[0])));
    });

    it('실패 404: 없는 id 값으로 조회', async () => {
      const notExistId = newsList.at(-1).id + 1;
      const { body } = await request(app.getHttpServer())
        .get(`/news/${notExistId}`)
        .set('Accept', 'application/json')
        .expect(404);

      expect(body).toEqual({ 'message': `id: ${notExistId} |해당 id의 news가 존재하지 않습니다.` });
    });
  });

  describe('PATCH /news/:id', () => {
    it('성공 200', async () => {
      const originalNews = newsList[0];
      await request(app.getHttpServer())
        .patch(`/news/${originalNews.id}`)
        .set('Accept', 'application/json')
        .send({ title: '공지사항999' })
        .expect(200);
      
      const expectedNews = await dataSource.getRepository(News).findOneBy({ id: originalNews.id });
      expect(expectedNews.title).toBe('공지사항999');
    });

    it('실패 400: body에 값을 잘못 전달', async () => {
      const originalNews = newsList[0];
      const { body } = await request(app.getHttpServer())
        .patch(`/news/${originalNews.id}`)
        .set('Accept', 'application/json')
        .send({ title: 123 })
        .expect(400);

      expect(body).toEqual({ message: 'Bad Request Exception' });
      const expectedNews = await dataSource.getRepository(News).findOneBy({ id: originalNews.id });
      expect(expectedNews.title).toBe(originalNews.title);
    });

    it('실패 404: 없는 id에 대해 수정 요청', async () => {
      const notExistNewsId = newsList.at(-1).id + 1;
      const { body } = await request(app.getHttpServer())
        .patch(`/news/${notExistNewsId}`)
        .set('Accept', 'application/json')
        .send({ title: '공지사항999' })
        .expect(404);
        
      expect(body).toEqual({ 'message': `id: ${notExistNewsId} |해당 id의 news가 존재하지 않습니다.` });
    });
  })

  describe('DELETE /news/:id', () => {
    it('성공 200', async () => {
      const originalNews = newsList[0];
      await request(app.getHttpServer())
        .delete(`/news/${originalNews.id}`)
        .set('Accept', 'application/json')
        .expect(200);
      
      const expectedNews = await dataSource.getRepository(News).findOneBy({ id: originalNews.id });
      expect(expectedNews).toBe(null);
    });

    it('실패 404: 없는 id에 대한 삭제 요청', async () => {
      const notExistNewsId = newsList.at(-1).id + 1;
      const { body } = await request(app.getHttpServer())
        .delete(`/news/${notExistNewsId}`)
        .set('Accept', 'application/json')
        .expect(404);

      expect(body).toEqual({ 'message': `id: ${notExistNewsId} |해당 id의 news가 존재하지 않습니다.` });
    });
  })
});