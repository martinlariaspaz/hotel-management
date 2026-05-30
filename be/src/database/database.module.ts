import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>("mongodb.uri"),
        dbName: configService.get<string>("mongodb.dbName"),
        authSource: configService.get<string>("mongodb.authSource"),
      }),
    }),
  ],
})
export class DatabaseModule {}
