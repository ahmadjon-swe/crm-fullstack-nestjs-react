import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("O'quv Markazi CRM API")
    .setDescription(
      `
## O'quv markazi boshqaruv tizimi (CRM)

### Autentifikatsiya
1. \`POST /api/auth/login\` — login va password bilan kirish (email'ga OTP yuboriladi)
2. \`POST /api/auth/verify\` — OTP tasdiqlash → access_token va refresh_token olish
3. Bearer token ni har so'rovda \`Authorization: Bearer <token>\` ko'rinishida yuboring

### Rollar
- **superadmin**: barcha huquqlar + adminlarni boshqarish
- **admin**: o'qituvchi, guruh, talaba, to'lov, davomat boshqarish

### Birinchi superadmin
Deploy vaqtida \`.env\` da SUPERADMIN_* o'zgaruvchilarini to'ldiring va seed skriptini ishga tushiring.
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'Bearer',
    )
    .addTag("Auth (Admins)", "Admin autentifikatsiyasi va boshqaruvi")
    .addTag('Teachers', "O'qituvchilar boshqaruvi")
    .addTag("Students", "O'quvchilar boshqaruvi")
    .addTag('Groups', 'Guruhlar boshqaruvi')
    .addTag('Payments', "To'lovlar va hisobotlar")
    .addTag('Attendance', 'Davomat boshqaruvi')
    .addTag('Dashboard', 'Bosh sahifa statistikasi')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`✅ Server: http://localhost:${PORT}/api`);
  console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
}
bootstrap();
