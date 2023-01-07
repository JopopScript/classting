import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { stringToInt } from '../util';
import { CustomValidateMessage } from '../validator/custom-validate-message';

export class PagenationDto {
  @ApiProperty({
    type: 'integer',
    description: '조회할 페이지',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => stringToInt(value))
  @IsOptional()
  @Min(1)
  @IsInt({ message: CustomValidateMessage.isInt})
  page: number = 1;
  
  @ApiProperty({
    type: 'integer',
    description: '한페이지에 보여질 수',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
  })
  @Transform(({ value }) => stringToInt(value))
  @IsOptional()
  @Min(1)
  @IsInt({ message: CustomValidateMessage.isInt})
  pageSize: number = 10;
}