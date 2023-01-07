import { PagenationDto } from '@/common/dto/pagenation.dto';
import { stringToInt } from '@/common/util';
import { CustomValidateMessage } from '@/common/validator/custom-validate-message';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class SubscribeAndPagenationDto extends PagenationDto {
  @ApiProperty({ type: 'integer', description: '구독한 사용자 아이디 ', example: 1 })
  @Transform(({ value }) => stringToInt(value))
  @IsOptional()
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  userId?: number;

  @ApiProperty({ type: 'integer', description: '구독당한 학교 아이디 ', example: 1, required: false })
  @Transform(({ value }) => stringToInt(value))
  @IsOptional()
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  schoolId?: number;
}
