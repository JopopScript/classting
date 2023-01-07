import { UserIdAndPagenationDto } from '@/common/dto/userid-and-pagenation.dto';
import { School } from '@/school/entities/school.entity';
import { SchoolService } from '@/school/school.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { Subscribe } from './entities/subscribe.entity';
import { SubscribeService } from './subscribe.service';

const mockUserModule = {
  module: class UserModule {},
  providers: [
    UserService,
    {
      provide: getRepositoryToken(User),
      useClass: Repository,
    },
  ],
  exports: [UserService],
};

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

describe('SubscribeService', () => {
  let service: SubscribeService;
  let userService: UserService;
  let schoolService: SchoolService;
  let repository: Repository<Subscribe>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [mockUserModule, mockSchoolModule],
      providers: [
        SubscribeService,
        {
          provide: getRepositoryToken(Subscribe),
          useClass: Repository<Subscribe>,
        },
      ],
    }).compile();
    service = module.get(SubscribeService);
    userService = module.get(UserService);
    schoolService = module.get(SchoolService);
    repository = module.get(getRepositoryToken(Subscribe));
  });

  describe('create', () => {
    it('정상처리', async () => {
      //given
      userService.findOneById = jest.fn().mockResolvedValue({} as User);
      schoolService.findOneById = jest.fn().mockResolvedValue({} as School);
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      const expectedSubscribe = {} as Subscribe;
      repository.save = jest.fn().mockResolvedValue(expectedSubscribe);
      // when
      const subscribe = await service.create({} as CreateSubscribeDto);
      // then
      expect(subscribe).toBe(expectedSubscribe);
    });

    it('에러발생: 요청한 user가 없는 경우', async () => {
      //given
      const expectedError = new NotFoundException();
      userService.findOneById = jest.fn().mockRejectedValue(expectedError);
      schoolService.findOneById = jest.fn().mockResolvedValue({} as School);
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      repository.save = jest.fn().mockResolvedValue({} as Subscribe);
      // when
      const subscribe = service.create({ userId: 1, schoolId: 1 } as CreateSubscribeDto);
      // then
      expect(subscribe).rejects.toBe(expectedError);
    });

    it('에러발생: 요청한 school이 없는 경우', async () => {
      //given
      const expectedError = new NotFoundException();
      userService.findOneById = jest.fn().mockResolvedValue({} as User);
      schoolService.findOneById = jest.fn().mockRejectedValue(expectedError);
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      repository.save = jest.fn().mockResolvedValue({} as Subscribe);
      // when
      const subscribe = service.create({ userId: 1, schoolId: 1 } as CreateSubscribeDto);
      // then
      expect(subscribe).rejects.toBe(expectedError);
    });

    it('에러발생: 이미 구독중인 경우', async () => {
      //given
      userService.findOneById = jest.fn().mockResolvedValue({} as User);
      schoolService.findOneById = jest.fn().mockResolvedValue({} as School);
      repository.findOneBy = jest.fn().mockResolvedValue({} as Subscribe);
      repository.save = jest.fn().mockResolvedValue({} as Subscribe);
      // when
      const subscribe = service.create({ userId: 1, schoolId: 1 } as CreateSubscribeDto);
      // then
      const expectedError = new UnprocessableEntityException(`userId: 1 |schoolId: 1 |userId의 사용자는 이미 schoolId의 학교를 구독중에 있습니다.`);
      expect(subscribe).rejects.toEqual(expectedError);
    });
  });

  describe('findAll', () => {
    it('정상처리', async () => {
      //given
      userService.findOneById = jest.fn().mockResolvedValue({} as User);
      const expectedSubscribes = [] as Subscribe[];
      repository.find = jest.fn().mockResolvedValue(expectedSubscribes);
      // when
      const subscribes = await service.findAll({} as UserIdAndPagenationDto);
      // then
      expect(subscribes).toBe(expectedSubscribes);
    });


    it('에러발생: 요청한 user가 없는 경우', async () => {
      //given
      const expectedError = new NotFoundException();
      userService.findOneById = jest.fn().mockRejectedValue(expectedError);
      repository.find = jest.fn().mockResolvedValue([] as Subscribe[]);
      // when
      const subscribes = service.findAll({} as UserIdAndPagenationDto);
      // then
      expect(subscribes).rejects.toBe(expectedError);
    });
  });

  describe('remove', () => {
      it('정상처리', async () => {
        //given
        repository.findOneBy = jest.fn().mockResolvedValue({} as Subscribe);
        repository.softRemove = jest.fn().mockResolvedValue({} as Subscribe);
        // when
        await service.remove({} as CreateSubscribeDto);
      });
  
      it('에러발생: id에 해당하는 subscribe이 존재하지 않는 경우', async () => {
        //given
        repository.findOneBy = jest.fn().mockResolvedValueOnce(null)
        repository.save = jest.fn().mockResolvedValue({} as Subscribe);
  
        // when
        const subscribe = service.remove({ userId: 1, schoolId: 1 });

        // then
        const expectedError = new NotFoundException(`userId: 1 |schoolId: 1 |해당하는 구독이 존재하지 않습니다.`);
        expect(subscribe).rejects.toEqual(expectedError);
      });
  });
});
