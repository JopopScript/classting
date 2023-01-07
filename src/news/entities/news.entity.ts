import { BaseEntity } from '@/common/entities/base-entity';
import { School } from '@/school/entities/school.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('ix_news_schoolid_createdat', ['schoolId', 'createdAt'], { unique: true })
@Entity('news')
export class News extends BaseEntity {
  @ApiProperty({ description: '제목', maxLength: 255, example: '학사일정' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ type: 'text', description: '내용', example: '3/2: 1학기시작\n 4/20~4/26: 중간고사 ....' })
  @Column({ type: 'text' })
  contents: string;
  
  @ApiProperty({ type: 'integer', description: '소식을 작성한 학교 아이디', example: 1 })
  @Column({ type: 'int4', name: 'school_id' })
  schoolId: number;

  @ApiProperty({ type: () => School })
  @ManyToOne(() => School, (school) => school.newsList, { cascade: ['update', 'soft-remove'] })
  @JoinColumn([{ name: 'school_id', referencedColumnName: 'id' }])
  school: School;
}
