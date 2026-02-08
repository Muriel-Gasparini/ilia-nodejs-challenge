import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`[MS-Users] Server running on port ${port}`);
}
bootstrap();
