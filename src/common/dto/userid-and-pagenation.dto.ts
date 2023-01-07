import { PagenationDto } from '@/common/dto/pagenation.dto';
import { CustomValidateMessage } from '@/common/validator/custom-validate-message';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';
import { stringToInt } from '../util';

export class UserIdAndPagenationDto extends PagenationDto {
  @ApiProperty({ type: 'integer', description: '검색한 사용자의 아이디', example: 1 })
  @Transform(({ value }) => stringToInt(value))
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  userId: number;
}
