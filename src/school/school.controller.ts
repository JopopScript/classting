import { PagenationDto } from '@/common/dto/pagenation.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';
import { SchoolService } from './school.service';

const SCHOOL = 'school' as const;
@Controller(SCHOOL)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @ApiOperation({ tags: [SCHOOL], summary: '학교 생성', description: '학교를 생성합니다.' })
  @ApiBody({ type: CreateSchoolDto }) 
  @ApiCreatedResponse({ type: School, description: '학교생성 성공, 생성된 학교 정보 반환' })
  @ApiResponse({ status: 422, description: '학교 생성 실패, 이미 생성된 이름으로 생성시도' })
  @ApiResponse({ status: 400, description: '학교 생성 실패, 잘못된 body값으로 요청' })
  create(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({ tags: [SCHOOL], summary: '학교목록 조회', description: '학교목록을 페이지로 조회합니다.' })
  @ApiOkResponse({
    description: '학교목록 조회 성공, 학교 목록 정보 반환',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(School) }
    }
  })
  findAll(@Query() query: PagenationDto): Promise<Array<School>> {
    return this.schoolService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ tags: [SCHOOL], summary: '학교 하나 조회', description: 'id에 해당하는 학교를 조회합니다.' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: School, description: '학교 조회 성공, 학교 정보 반환' })
  @ApiResponse({ status: 404, description: '학교 조회 실패, 잘못된 id값으로 요청' })
  findOneById(@Param('id', ParseIntPipe) id: number): Promise<School> {
    return this.schoolService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ tags: [SCHOOL], summary: '학교 수정', description: '기존에 있는 학교를 수정합니다.' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateSchoolDto })
  @ApiOkResponse({ type: School, description: '학교정보 수정 성공, 수정된 정보 반환' })
  @ApiResponse({ status: 404, description: '학교정보 수정 실패, 잘못된 id값으로 요청' })
  @ApiResponse({ status: 422, description: '학교정보 수정 실패, 이미존재하는 학교명으로 수정 요청' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSchoolDto: UpdateSchoolDto): Promise<School> {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({ tags: [SCHOOL], summary: '학교 삭제', description: '기존에 있는 학교를 삭제합니다.' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: '학교 삭제 성공' })
  @ApiResponse({ status: 404, description: '학교정보 삭제 실패, 잘못된 id값으로 요청' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.schoolService.remove(id);
  }
}