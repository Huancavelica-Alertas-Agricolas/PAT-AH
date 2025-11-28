import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemaAlertService1760210072998 implements MigrationInterface {
    name = 'InitSchemaAlertService1760210072998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."alerts_type_enum" AS ENUM('lluvia', 'temperatura', 'helada', 'sequia', 'viento')`);
        await queryRunner.query(`CREATE TYPE "public"."alerts_status_enum" AS ENUM('activa', 'enviada', 'cancelada', 'expirada')`);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "type" "public"."alerts_type_enum" NOT NULL DEFAULT 'lluvia', "status" "public"."alerts_status_enum" NOT NULL DEFAULT 'activa', "stationId" integer NOT NULL, "userId" integer NOT NULL, "timestamp" TIMESTAMP NOT NULL, "expiresAt" TIMESTAMP, "params" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."alert_channels_channel_enum" AS ENUM('email', 'sms', 'push', 'webhook')`);
        await queryRunner.query(`CREATE TYPE "public"."alert_channels_status_enum" AS ENUM('pendiente', 'enviado', 'fallido', 'entregado')`);
        await queryRunner.query(`CREATE TABLE "alert_channels" ("id" SERIAL NOT NULL, "alertId" integer NOT NULL, "channel" "public"."alert_channels_channel_enum" NOT NULL, "recipient" character varying NOT NULL, "status" "public"."alert_channels_status_enum" NOT NULL DEFAULT 'pendiente', "sentAt" TIMESTAMP, "errorMessage" text, "metadata" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da89e9de0358309fb2ec1617e65" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "alert_channels" ADD CONSTRAINT "FK_1bc782dccfff6dc420232c84165" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert_channels" DROP CONSTRAINT "FK_1bc782dccfff6dc420232c84165"`);
        await queryRunner.query(`DROP TABLE "alert_channels"`);
        await queryRunner.query(`DROP TYPE "public"."alert_channels_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."alert_channels_channel_enum"`);
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_type_enum"`);
    }

}
