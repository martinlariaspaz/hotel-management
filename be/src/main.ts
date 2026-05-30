import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  ApiExceptionFilter,
  createValidationException,
} from "./common/errors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigin =
    configService.get<string[] | true>("app.corsOrigin") ?? true;

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: createValidationException,
    }),
  );

  const port = configService.get<number>("app.port") ?? 3000;
  await app.listen(port);
}

void bootstrap();
