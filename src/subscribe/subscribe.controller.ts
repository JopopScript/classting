import { UserIdAndPagenationDto } from '@/common/dto/userid-and-pagenation.dto';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { Subscribe } from './entities/subscribe.entity';
import { SubscribeService } from './subscribe.service';

const SUBSCRIBE = 'subscribe' as const;
@Controller(SUBSCRIBE)
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Post()
  @ApiOperation({ tags: [SUBSCRIBE], summary: '구독 하기', description: '입력한 학교를 구독합니다.' })
  @ApiBody({ type: CreateSubscribeDto }) 
  @ApiCreatedResponse({ type: CreateSubscribeDto, description: '구독 성공, 구독정보 반환' })
  @ApiResponse({ status: 400, description: '학교 생성 실패, 잘못된 body값으로 요청' })
  @ApiResponse({ status: 404, description: '구독 실패, userId 또는 schoolId에 해당하는 자원이 존재하지 않는 경우' })
  @ApiResponse({ status: 422, description: '구독 실패, 요청아이디가 잘못된 경우, 이미 구독이 되어 있는 경우' })
  create(@Body() createSubscribeDto: CreateSubscribeDto): Promise<Subscribe> {
    return this.subscribeService.create(createSubscribeDto);
  }

  @Get()
  @ApiOperation({ tags: [SUBSCRIBE], summary: '구독목록 조회', description: '구독목록을 페이지로 조회합니다.' })
  @ApiOkResponse({
    description: '구독목록 조회 성공, 구독 목록 반환',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(Subscribe) }
    }
  })
  findAll(@Query() userIdAndPagenationDto: UserIdAndPagenationDto): Promise<Array<Subscribe>> {
    return this.subscribeService.findAll(userIdAndPagenationDto);
  }

  @Delete()
  @ApiOperation({ tags: [SUBSCRIBE], summary: '구독 취소', description: '입력한 id의 학교 구독을 취소 합니다.' })
  @ApiBody({ type: CreateSubscribeDto })
  @ApiResponse({ status: 200, description: '구독 취소 성공' })
  @ApiResponse({ status: 400, description: '학교 삭제 실패, 잘못된 body값으로 요청' })
  @ApiResponse({ status: 404, description: '학교 삭제 실패, 잘못된 id값으로 요청' })
  remove(@Body() createSubscribeDto: CreateSubscribeDto): Promise<void> {
    return this.subscribeService.remove(createSubscribeDto);
  }
}
