import { School } from '@/school/entities/school.entity';
import { SchoolService } from '@/school/school.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';
import { NewsService } from './news.service';
import { CustomNewsRepository } from './repository/custom-news.repository';

const mockSchoolModule = {
  module: class SchoolModule {},
  providers: [
    SchoolService,
    {
      provide: getRepositoryToken(School),
      useClass: Repository,
    },
  ],
  exports: [SchoolService],
};

describe('NewsService', () => {
  let service: NewsService;
  let schoolService: SchoolService;
  let repository: CustomNewsRepository;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [mockSchoolModule],
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(CustomNewsRepository),
          useValue: jest.mock('@/news/repository/custom-news.repository'),
        },
      ],
    }).compile();
    service = module.get(NewsService);
    repository = module.get(CustomNewsRepository);
    schoolService = module.get(SchoolService);
  });

  describe('create', () => {
    it('정상처리', async () => {
      //given
      schoolService.findOneById = jest.fn().mockResolvedValue({});
      const expectedNews = {} as News
      repository.save = jest.fn().mockResolvedValue(expectedNews);
      // when
      const news = await service.create({} as CreateNewsDto);
      // then
      expect(news).toBe(expectedNews);
    });

    it('에러발생: 요청한 schoolId의 데이터가 없는 경우', async () => {
      //given
      const expectedError = new NotFoundException();
      schoolService.findOneById = jest.fn().mockRejectedValue(expectedError);
      repository.save = jest.fn().mockResolvedValue({} as News);
      // when
      const news = service.create({ title: 'a', contents: 'b', schoolId: 1 });
      //then
      expect(news).rejects.toEqual(expectedError);
    });
  });

  describe('findAll', () => {
    describe('정상처리', () => {
      test.each`
      userIdAndPagenationDto                                     | expected
      ${{ userId: 123, schoolId: 12, page: 123, pageSize: 345 }} | ${{ userId: 123, schoolId: 12, skip: 42090, take: 345 }}
      ${{ userId: 99, page: 1, pageSize: 1 }}                    | ${{ userId: 99, schoolId: undefined, skip: 0, take: 1 }}
      ${{ schoolId: 1, page: 11, pageSize: 7 }}                  | ${{ userId: undefined, schoolId: 1, skip: 70, take: 7 }}
      ${{ page: 1, pageSize: 10 }}                               | ${{ userId: undefined, schoolId: undefined, skip: 0, take: 10 }}
      `('userIdAndPagenationDto: $userIdAndPagenationDto', async ({ userIdAndPagenationDto, expected }) => {
        //given
        const mockFunction = jest.fn();
        repository.findBySubscribeAndSkipAndTake = mockFunction;
        mockFunction.mockResolvedValue([]);
        // when
        await service.findAll(userIdAndPagenationDto);
        //then
        const argument = mockFunction.mock.calls[0];
        expect(argument[0]).toBe(expected.skip);
        expect(argument[1]).toBe(expected.take);
        expect(argument[2]).toBe(expected.userId);
        expect(argument[3]).toBe(expected.schoolId);
      });
    });
  });

  describe('findOneById', () => {
    it('정상처리', async () => {
      //given
      repository.findOne = jest.fn().mockResolvedValue({} as News);
      // when
      const news = await service.findOneById(1);
    });

    it('에러발생: 해당 아이디의 news이 없는 경우', async () => {
      //given
      repository.findOne = jest.fn().mockResolvedValue(null);
      // when
      const news = service.findOneById(1);
      // then
      const expectedError = new NotFoundException(`id: 1 |해당 id의 news가 존재하지 않습니다.`);
      expect(news).rejects.toEqual(expectedError);
    });
  });

  describe('update', () => {
    it('정상처리', async () => {
      //given
      const expectedNews = { title: 'hello', contents: 'world', schoolId: 1 }
      const mockFunction = jest.fn();
      repository.findOne = jest.fn().mockResolvedValueOnce({ title: 'h', contents: 'world', schoolId: 99 } as News);
      schoolService.findOneById = jest.fn().mockResolvedValue({} as School);
      repository.save = mockFunction.mockResolvedValue({} as News);
      // when
      const news = await service.update(1, { title: 'hello', schoolId: 1 } as UpdateNewsDto);

      //then
      const argument = mockFunction.mock.calls[0][0];
      expect(argument).toEqual(expectedNews);
    });

    it('에러발생: id에 해당하는 news이 존재하지 않는 경우', async () => {
      //given
      repository.findOne = jest.fn().mockResolvedValueOnce(null);
      schoolService.findOneById = jest.fn().mockResolvedValue({} as School);
      repository.save = jest.fn().mockResolvedValue({} as News);

      // when
      const news = service.update(1, {} as UpdateNewsDto);

      // then
      const expectedError = new NotFoundException(`id: 1 |해당 id의 news가 존재하지 않습니다.`)
      expect(news).rejects.toEqual(expectedError);
    });
  });

  describe('remove', () => {
      it('정상처리', async () => {
        //given
        repository.findOne = jest.fn().mockResolvedValueOnce({} as News)
        repository.softRemove = jest.fn().mockResolvedValue({} as News);
  
        // when
        const news = await service.remove(1);
      });
  
      it('에러발생: id에 해당하는 news이 존재하지 않는 경우', async () => {
        //given
        repository.findOneBy = jest.fn().mockResolvedValueOnce(null)
        repository.softRemove = jest.fn().mockResolvedValue({} as News);
  
        // when
        const news = service.remove(1);

        // then
        const expectedError = new NotFoundException(`id: 1 |해당 id의 news가 존재하지 않습니다.`)
        expect(news).rejects.toEqual(expectedError);
      });
  });
});
