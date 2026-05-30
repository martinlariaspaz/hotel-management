import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { MailModule } from "./mail/mail.module";
import { MaintenanceBlocksModule } from "./maintenance-blocks/maintenance-blocks.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { RoomTypesModule } from "./room-types/room-types.module";
import { RoomsModule } from "./rooms/rooms.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    MailModule,
    MaintenanceBlocksModule,
    RealtimeModule,
    RoomTypesModule,
    RoomsModule,
  ],
})
export class AppModule {}
