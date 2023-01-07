import { School } from '@/school/entities/school.entity';
import { User } from '@/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Index('ix_subscribe_userid_schoolid_createdat', ['userId', 'schoolId', 'createdAt'])
@Entity('subscribe')
export class Subscribe {
  @ApiProperty({ description: '기본키', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '구독일시' })
  @ApiProperty({ description: '구독일시', example: '2023-01-04T21:51:54.234Z' })
  @CreateDateColumn({ name: 'created_at', comment: '구독일시' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', comment: '구독취소일시' })
  deletedAt: Date;
  
  @ApiProperty({ type: 'integer', description: '구독한 사용자 아이디', example: 1 })
  @Column({ type: 'int4', name: 'user_id' })
  userId: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.subscribes, { cascade: ['update', 'soft-remove'] })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
  
  @ApiProperty({ type: 'integer', description: '구독된(구독당한) 학교 아이디', example: 1 })
  @Column({ type: 'int4', name: 'school_id' })
  schoolId: number;

  @ApiProperty({ type: () => School })
  @ManyToOne(() => School, (school) => school.subscribes, { cascade: ['update', 'soft-remove'] })
  @JoinColumn([{ name: 'school_id', referencedColumnName: 'id' }])
  school: School;
}
