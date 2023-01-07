import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository<User>,
        },
      ],
    }).compile();
    service = module.get(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findOneById', () => {
    it('정상처리', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue({} as User);
      // when
      const user = await service.findOneById(1);
    });

    it('에러발생: 해당 아이디의 user가 없는 경우', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      // when
      const user = service.findOneById(1);
      // then
      const expectedError = new NotFoundException(`id: 1 |해당 id의 user가 존재하지 않습니다.`)
      expect(user).rejects.toEqual(expectedError);
    });
  });

  describe('update', () => {
    it('정상처리', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue({
        name: 'kero',
        role: 'ADMIN'
      } as User)
      const mockFunction = jest.fn();
      repository.save = mockFunction;
      // when
      await service.update(1, { name: 'giro', role: 'STUDENT' } as UpdateUserDto);
      // then
      const argument = mockFunction.mock.calls[0][0];
      expect(argument.name).toBe('giro');
      expect(argument.role).toBe('STUDENT');
    });

    it('에러발생: id에 해당하는 user가 존재하지 않는 경우', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      repository.save = jest.fn().mockResolvedValue({} as User);
      // when
      const user = service.update(1, {} as UpdateUserDto);
      // then
      const expectedError = new NotFoundException(`id: 1 |해당 id의 user가 존재하지 않습니다.`)
      expect(user).rejects.toEqual(expectedError);
    });
  });

  describe('remove', () => {
    it('정상처리', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue({} as User);
      repository.softRemove = jest.fn().mockResolvedValue({} as User);
      // when
      await service.remove(1);
    });

    it('에러발생: id에 해당하는 user가 존재하지 않는 경우', async () => {
      //given
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      repository.softRemove = jest.fn().mockResolvedValue({} as User);
      // when
      const result = service.remove(1);
      // then
      const expectedError = new NotFoundException(`id: 1 |해당 id의 user가 존재하지 않습니다.`);
      expect(result).rejects.toEqual(expectedError);
    });

  });
});
