import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    Logger.debug(`UserService |create() call |createUserDto: `, createUserDto);
    return await this.userRepository.save(createUserDto);
  }

  async findOneById(id: number): Promise<User> {
    Logger.debug(`UserService |findOneById() call |id: ${id}`);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`id: ${id} |해당 id의 user가 존재하지 않습니다.`)
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    Logger.debug(`UserService |update() call |id: ${id} |updateUserDto: `, updateUserDto);
    const originalUser = await this.findOneById(id);
    return await this.userRepository.save({ ...originalUser, ...updateUserDto });
  }

  async remove(id: number): Promise<void> {
    Logger.debug(`UserService |remove() call |id: ${id}`);
    const user = await this.findOneById(id);
    await this.userRepository.softRemove(user);
  }
}