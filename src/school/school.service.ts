import { PagenationDto } from '@/common/dto/pagenation.dto';
import { negativeNumberToZero } from '@/common/util';
import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';

@Injectable()
export class SchoolService {
  constructor(@InjectRepository(School) private readonly schoolRepository: Repository<School>) {}

  async create(createSchoollDto: CreateSchoolDto): Promise<School> {
    Logger.debug(`SchoolService |create() call |createUserDto: `, createSchoollDto);
    await this.validateDuplicateName(createSchoollDto.name);
    return await this.schoolRepository.save(createSchoollDto);
  }

  async findAll({ page, pageSize }: PagenationDto): Promise<Array<School>> {
    Logger.debug(`SchoolService |findAll() call |page: ${page}, pageSize: ${pageSize}`);
    const skip = negativeNumberToZero((page - 1) * pageSize);
    const take = pageSize;
    return await this.schoolRepository.find({
      order: { name: 'ASC' },
      skip,
      take
    });
  }

  async findOneById(id: number): Promise<School> {
    Logger.debug(`SchoolService |findOneById() call |id: ${id}`);
    const school = await this.schoolRepository.findOneBy({ id });
    if (!school) {
      throw new NotFoundException(`id: ${id} |해당 id의 school이 존재하지 않습니다.`)
    }
    return school;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    Logger.debug(`SchoolService |update() call |id: ${id} |updateSchoolDto: `, updateSchoolDto);
    const originalSchool = await this.findOneById(id);
    if (updateSchoolDto.name && updateSchoolDto.name !== originalSchool.name) {
      await this.validateDuplicateName(updateSchoolDto.name);
    }
    return await this.schoolRepository.save({ ...originalSchool, ...updateSchoolDto });
  }

  async remove(id: number): Promise<void> {
    Logger.debug(`SchoolService |remove() call |id: ${id}`);
    const school = await this.findOneById(id);
    await this.schoolRepository.softRemove(school);
  }

  private async validateDuplicateName(name: string): Promise<void> {
    const equalNameSchool = await this.schoolRepository.findOneBy({ name });
    if (equalNameSchool) {
      throw new UnprocessableEntityException(`name: ${name} |name이 같은 school이 이미 존재합니다.`)
    }
  }
}
