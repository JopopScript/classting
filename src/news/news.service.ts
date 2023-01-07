import { negativeNumberToZero } from '@/common/util';
import { SchoolService } from '@/school/school.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { SubscribeAndPagenationDto } from './dto/subscribe-and-pagenation.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';
import { CustomNewsRepository } from './repository/custom-news.repository';

@Injectable()
export class NewsService {
  constructor(
    private readonly newsRepository: CustomNewsRepository,
    private readonly schoolService: SchoolService,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    Logger.debug(`NewsService |create() call |createNewsDto: `, createNewsDto);
    await this.schoolService.findOneById(createNewsDto.schoolId);
    return await this.newsRepository.save(createNewsDto);
  }

  async findAll({ page, pageSize, userId, schoolId }: SubscribeAndPagenationDto): Promise<Array<News>> {
    Logger.debug(`NewsService |findAll() call |page: ${page}, pageSize: ${pageSize} |userId: ${userId} |schoolId: ${schoolId}`);
    const skip = negativeNumberToZero((page - 1) * pageSize);
    const take = pageSize;
    return this.newsRepository.findBySubscribeAndSkipAndTake(skip, take, userId, schoolId);
  }

  async findOneById(id: number): Promise<News> {
    Logger.debug(`NewsService |findOneById() call |id: ${id}`);
    const news = await this.newsRepository.findOne({
      relations: ['school'],
      where: { id }
    });
    if (!news) {
      throw new NotFoundException(`id: ${id} |해당 id의 news가 존재하지 않습니다.`)
    }
    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News> {
    Logger.debug(`NewsService |update() call |id: ${id} |updateNewsDto: `, updateNewsDto);
    const originalNews = await this.findOneById(id);
    updateNewsDto.schoolId && await this.schoolService.findOneById(updateNewsDto.schoolId);
    return await this.newsRepository.save({ ...originalNews, ...updateNewsDto });
  }

  async remove(id: number): Promise<void> {
    Logger.debug(`NewsService |remove() call |id: ${id}`);
    const news = await this.findOneById(id);
    await this.newsRepository.softRemove(news);
  }
}
