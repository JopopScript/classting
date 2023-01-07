import { UserIdAndPagenationDto } from '@/common/dto/userid-and-pagenation.dto';
import { negativeNumberToZero } from '@/common/util';
import { SchoolService } from '@/school/school.service';
import { UserService } from '@/user/user.service';
import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { Subscribe } from './entities/subscribe.entity';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Subscribe) private readonly subscribeRepository: Repository<Subscribe>,
    private readonly userService: UserService,
    private readonly schoolService: SchoolService,
  ) {}
  
  async create({ userId, schoolId }: CreateSubscribeDto): Promise<Subscribe> {
    Logger.debug(`SubscribeService |create() call |userId: ${userId} |schoolId: ${schoolId}`);
    await this.validateExistUser(userId);
    await this.validateExistSchool(schoolId);
    const alreadySubscribe = await this.findOneByUserIdAndSchoolId(userId, schoolId);
    if (alreadySubscribe) {
      throw new UnprocessableEntityException(`userId: ${userId} |schoolId: ${schoolId} |userId의 사용자는 이미 schoolId의 학교를 구독중에 있습니다.`)
    }
    return await this.subscribeRepository.save({ userId, schoolId });
  }

  async findAll({ userId, page, pageSize }: UserIdAndPagenationDto): Promise<Array<Subscribe>> {
    Logger.debug(`SubscribeService |findAll() call |userId: ${userId} |page: ${page}, pageSize: ${pageSize}`);
    await this.validateExistUser(userId);
    const skip = negativeNumberToZero((page - 1) * pageSize);
    const take = pageSize;
    return this.subscribeRepository.find({
      relations: ['school'],
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async remove({ userId, schoolId }: CreateSubscribeDto): Promise<void> {
    Logger.debug(`SubscribeService |remove() call |userId: ${userId} |schoolId: ${schoolId}`);
    const subscribe = await this.findOneByUserIdAndSchoolId(userId, schoolId);
    if (!subscribe) {
      throw new NotFoundException(`userId: ${userId} |schoolId: ${schoolId} |해당하는 구독이 존재하지 않습니다.`)
    }
    await this.subscribeRepository.softRemove(subscribe);
  }

  private async validateExistUser(userId: number): Promise<void> {
    await this.userService.findOneById(userId);
  }

  private async validateExistSchool(schoolId: number): Promise<void> {
    await this.schoolService.findOneById(schoolId);
  }

  private async findOneByUserIdAndSchoolId(userId: number, schoolId: number): Promise<Subscribe> {
    return this.subscribeRepository.findOneBy({ userId, schoolId });
  }
}
