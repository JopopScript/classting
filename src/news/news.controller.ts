import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CreateNewsDto } from './dto/create-news.dto';
import { SubscribeAndPagenationDto } from './dto/subscribe-and-pagenation.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';
import { NewsService } from './news.service';

const NEWS = 'news' as const;
@Controller(NEWS)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiOperation({ tags: [NEWS], summary: '소식 생성', description: '소식을 생성합니다.' })
  @ApiBody({ type: CreateNewsDto }) 
  @ApiCreatedResponse({ type: News, description: '소식생성 성공, 생성된 소식 반환' })
  @ApiResponse({ status: 404, description: '소식 생성 실패, 존재하지않는 schoolId로 생성 요청' })
  @ApiResponse({ status: 400, description: '소식 생성 실패, 잘못된 body값으로 요청' })
  create(@Body() createNewsDto: CreateNewsDto): Promise<News> {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ tags: [NEWS], summary: '소식목록 조회', description: '소식목록을 페이지로 조회합니다.' })
  @ApiOkResponse({
    description: '소식목록 조회 성공, 소식 목록 반환',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(News) }
    }
  })
  findAll(@Query() subscribeAndPagenationDto: SubscribeAndPagenationDto): Promise<Array<News>> {
    return this.newsService.findAll(subscribeAndPagenationDto);
  }

  @Get(':id')
  @ApiOperation({ tags: [NEWS], summary: '소식 하나 조회', description: 'id에 해당하는 소식을 조회합니다.' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: News, description: '소식 조회 성공, 소식 정보 반환' })
  @ApiResponse({ status: 404, description: '소식 조회 실패, 잘못된 id값으로 요청' })
  findOneById(@Param('id', ParseIntPipe) id: number): Promise<News> {
    return this.newsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ tags: [NEWS], summary: '소식 수정', description: '기존에 있는 소식을 수정합니다.' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateNewsDto })
  @ApiOkResponse({ type: News, description: '소식 수정 성공, 수정된 소식 반환' })
  @ApiResponse({ status: 422, description: '소식 수정 실패, 잘못된 id값으로 요청' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: UpdateNewsDto): Promise<News> {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiOperation({ tags: [NEWS], summary: '소식 삭제', description: '기존에 있는 소식을 삭제합니다.' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: '소식 삭제 성공' })
  @ApiResponse({ status: 422, description: '소식 수정 실패, 잘못된 id값으로 요청' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.newsService.remove(id);
  }
}