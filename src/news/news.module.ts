import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NewsController } from './news.controller';
import { SchoolModule } from '@/school/school.module';
import { CustomNewsRepository } from './repository/custom-news.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    SchoolModule
  ],
  controllers: [NewsController],
  providers: [
    CustomNewsRepository, 
    NewsService,
  ],
  exports: [
    CustomNewsRepository,
    NewsService,
  ],
})
export class NewsModule {}
