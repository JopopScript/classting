import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { News } from "../entities/news.entity";

//https://stackoverflow.com/questions/72957962/how-to-extend-typeorm-repository-in-nestjs-9-typeorm-3
@Injectable()
export class CustomNewsRepository extends Repository<News> {
  constructor(
    @InjectRepository(News)
    private readonly repository: Repository<News>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findBySubscribeAndSkipAndTake(skip: number, take: number, userId?: number, schoolId?: number): Promise<Array<News>> {
    const qb = this.repository.createQueryBuilder('n')
      .withDeleted()
      .leftJoinAndSelect('n.school', 'school')
      .innerJoin('subscribe', 's')
      .where('n.schoolId = s.schoolId');
    if (userId) {
      qb.andWhere('s.userId = :userId', { userId })
        .andWhere(`n.createdAt BETWEEN s.createdAt AND IFNULL(s.deletedAt, NOW())`);
    } 
    schoolId && qb.andWhere('s.schoolId = :schoolId', { schoolId });
    qb.orderBy('n.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    return (await qb.getMany());
  }
}