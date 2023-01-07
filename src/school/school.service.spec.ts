import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';
import { SchoolService } from './school.service';

describe('SchoolService', () => {
  let service: SchoolService;
  let repository: Repository<School>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolService,
        {
          provide: getRepositoryToken(School),
          useClass: Repository<School>,
        },
      ],
    }).compile();
    service = module.get(SchoolService);
    repository = module.get(getRepositoryToken(School));
  });

  describe('create', () => {
    it('정상처리', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue(null)
      repository.save = jest.fn().mockResolvedValue({} as School)

      // when
      await service.create({} as CreateSchoolDto);
    });

    it('에러발생: 중복된 이름으로 생성요청', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue({} as School)
      repository.save = jest.fn().mockResolvedValue({} as School)

      // when
      const createdSchool = service.create({ name: 'abc'} as CreateSchoolDto);

      //then
      const expectedError = new UnprocessableEntityException(`name: abc |name이 같은 school이 이미 존재합니다.`)
      expect(createdSchool).rejects.toEqual(expectedError);
    });
  });

  describe('findAll', () => {
    describe('정상처리', () => {
      test.each([
        { pagenation: { page: 99, pageSize: 231 }, expected: { skip: 22638, take: 231 } },
        { pagenation: { page: 1, pageSize: 1 }, expected: { skip: 0, take: 1 } },
        { pagenation: { page: 11, pageSize: 10 }, expected: { skip: 100, take: 10 } },
      ])('pagenation: $pagenation', async ({ pagenation, expected }) => {
        //given
        const mockFunction = jest.fn();
        repository.find = mockFunction;
        mockFunction.mockResolvedValue([]);

        // when
        await service.findAll(pagenation);

        //then
        const argument = mockFunction.mock.calls[0][0];
        expect(argument.skip).toBe(expected.skip);
        expect(argument.take).toBe(expected.take);
      });
    });
  });

  describe('findOneById', () => {
    it('정상처리', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue({} as School);

      // when
      const school = await service.findOneById(1);
    });

    it('에러발생: 해당 아이디의 school이 없는 경우', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue(null);

      // when
      const school = service.findOneById(1);

      // then
      const expectedError = new UnprocessableEntityException(`id: 1 |해당 id의 school이 존재하지 않습니다.`);
      expect(school).rejects.toEqual(expectedError);

    });
  });

  describe('update', () => {
    it('정상처리', async () => {
      //given
      repository.findOneBy = jest.fn()
        .mockResolvedValueOnce({} as School)
        .mockResolvedValue(null);
      repository.save = jest.fn().mockResolvedValue({} as School);

      // when
      const school = await service.update(1, {} as UpdateSchoolDto);
    });

    it('에러발생: id에 해당하는 school이 존재하지 않는 경우', async () => {
      //given
      repository.findOneBy = jest.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValue(null);
      repository.save = jest.fn().mockResolvedValue({} as School);

      // when
      const school = service.update(1, {} as UpdateSchoolDto);

      // then
      const expectedError = new UnprocessableEntityException(`id: 1 |해당 id의 school이 존재하지 않습니다.`)
      expect(school).rejects.toEqual(expectedError);
    });

    it('에러발생: 변경하고자 하는 name으로 이미 school이 존재하는 경우', async () => {
      //given
      repository.findOneBy = jest.fn()
        .mockResolvedValueOnce({} as School)
        .mockResolvedValue({} as School);
      repository.save = jest.fn().mockResolvedValue({} as School);

      // when
      const school = service.update(1, { name: '한국고등학교'} as UpdateSchoolDto);

      // then
      const expectedError = new UnprocessableEntityException(`name: 한국고등학교 |name이 같은 school이 이미 존재합니다.`)
      expect(school).rejects.toEqual(expectedError);
    });
  });

  describe('remove', () => {
      it('정상처리', async () => {
        //given
        repository.findOneBy = jest.fn().mockResolvedValueOnce({} as School)
        repository.softRemove = jest.fn().mockResolvedValue({} as School);
  
        // when
        const school = await service.remove(1);
      });
  
      it('에러발생: id에 해당하는 school이 존재하지 않는 경우', async () => {
        //given
        repository.findOneBy = jest.fn().mockResolvedValueOnce(null)
        repository.softRemove = jest.fn().mockResolvedValue({} as School);
  
        // when
        const school = service.remove(1);

        // then
        const expectedError = new UnprocessableEntityException(`id: 1 |해당 id의 school이 존재하지 않습니다.`)
        expect(school).rejects.toEqual(expectedError);
      });
  });
});
