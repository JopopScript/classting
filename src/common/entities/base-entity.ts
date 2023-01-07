import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BaseEntity {
  @ApiProperty({ description: '기본키', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: '생성일시', example: '2023-01-04T21:51:54.234Z' })
  @CreateDateColumn({ name: 'created_at', comment: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2023-01-04T21:51:54.234Z' })
  @UpdateDateColumn({ name: 'updated_at', comment: '수정일시' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', comment: '삭제일시' })
  deletedAt: Date;
}
