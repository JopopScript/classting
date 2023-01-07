import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';


const USER = 'user' as const;
@Controller(USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ tags: [USER], summary: '사용자 생성', description: '사용자를 생성합니다.' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: User, description: '사용자 생성 성공, 생성된 사용자 정보 반환' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  @ApiResponse({ status: 400, description: 'body를 잘못 작성' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ tags: [USER], summary: '사용자 조회', description: 'id에 해당하는 사용자를 조회합니다.' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: User, description: '사용자 조회 성공, 사용자 정보 반환' })
  @ApiResponse({ status: 404, description: '사용자 조회 실패, 잘못된 id값으로 요청' })
  findOneById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ tags: [USER], summary: '사용자 수정', description: '기존에 있는 사용자를 수정합니다.' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: User, description: '사용자정보 수정 성공, 수정된 정보 반환' })
  @ApiResponse({ status: 404, description: '사용자정보 수정 실패, 잘못된 id값으로 요청' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ tags: [USER], summary: '사용자 삭제', description: '기존에 있는 사용자를 삭제합니다.' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: '사용자 삭제 성공' })
  @ApiResponse({ status: 404, description: '사용자 삭제 실패, 잘못된 id값으로 요청' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}