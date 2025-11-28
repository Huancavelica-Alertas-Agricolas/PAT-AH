import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChannelEnumAlertService1760212001000 implements MigrationInterface {
    name = 'UpdateChannelEnumAlertService1760212001000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create new enum type and swap
        await queryRunner.query(`CREATE TYPE "public"."alert_channels_channel_enum_new" AS ENUM('telegram','gmail','sms')`);
        await queryRunner.query(`ALTER TABLE "alert_channels" ALTER COLUMN "channel" TYPE "public"."alert_channels_channel_enum_new" USING channel::text::"public"."alert_channels_channel_enum_new"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."alert_channels_channel_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."alert_channels_channel_enum_new" RENAME TO "alert_channels_channel_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Cannot easily revert enum change safely - leave noop or recreate old enum
    }
}
