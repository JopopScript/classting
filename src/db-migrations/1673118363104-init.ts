import { MigrationInterface, QueryRunner } from "typeorm";

export class init1673118363104 implements MigrationInterface {
    name = 'init1673118363104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL COMMENT '생성일시' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL COMMENT '수정일시' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL COMMENT '삭제일시', \`name\` varchar(255) NOT NULL, \`role\` varchar(30) NOT NULL, INDEX \`ix_user_name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subscribe\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL COMMENT '구독일시' DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL COMMENT '구독취소일시', \`user_id\` int NOT NULL, \`school_id\` int NOT NULL, INDEX \`ix_subscribe_userid_schoolid_createdat\` (\`user_id\`, \`school_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`school\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL COMMENT '생성일시' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL COMMENT '수정일시' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL COMMENT '삭제일시', \`name\` varchar(255) NOT NULL, \`area\` varchar(20) NOT NULL, \`user_id\` int NOT NULL, UNIQUE INDEX \`ix_school_name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`news\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL COMMENT '생성일시' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL COMMENT '수정일시' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL COMMENT '삭제일시', \`title\` varchar(255) NOT NULL, \`contents\` text NOT NULL, \`school_id\` int NOT NULL, UNIQUE INDEX \`ix_news_schoolid_createdat\` (\`school_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`subscribe\` ADD CONSTRAINT \`FK_81a2738021382c267e417571dec\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subscribe\` ADD CONSTRAINT \`FK_0f3ddf0b52f6da5eadf3d21e5cd\` FOREIGN KEY (\`school_id\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`school\` ADD CONSTRAINT \`FK_b75c78082d7ea9dff30f9aba409\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`news\` ADD CONSTRAINT \`FK_bb7390f6957bd07a5146b021cb3\` FOREIGN KEY (\`school_id\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`news\` DROP FOREIGN KEY \`FK_bb7390f6957bd07a5146b021cb3\``);
        await queryRunner.query(`ALTER TABLE \`school\` DROP FOREIGN KEY \`FK_b75c78082d7ea9dff30f9aba409\``);
        await queryRunner.query(`ALTER TABLE \`subscribe\` DROP FOREIGN KEY \`FK_0f3ddf0b52f6da5eadf3d21e5cd\``);
        await queryRunner.query(`ALTER TABLE \`subscribe\` DROP FOREIGN KEY \`FK_81a2738021382c267e417571dec\``);
        await queryRunner.query(`DROP INDEX \`ix_news_schoolid_createdat\` ON \`news\``);
        await queryRunner.query(`DROP TABLE \`news\``);
        await queryRunner.query(`DROP INDEX \`ix_school_name\` ON \`school\``);
        await queryRunner.query(`DROP TABLE \`school\``);
        await queryRunner.query(`DROP INDEX \`ix_subscribe_userid_schoolid_createdat\` ON \`subscribe\``);
        await queryRunner.query(`DROP TABLE \`subscribe\``);
        await queryRunner.query(`DROP INDEX \`ix_user_name\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
