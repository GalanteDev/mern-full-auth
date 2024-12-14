import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let server: Handler;

async function bootstrap(): Promise<Handler | void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.IS_OFFLINE ? 'http://localhost:3000' : '*',
    credentials: true,
  });

  // Configurar Swagger para el entorno offline
  const isOffline =
    process.env.IS_OFFLINE === 'true' || process.env.AWS_SAM_LOCAL === 'true';

  const stagePrefix = process.env.IS_OFFLINE ? '/dev' : '';

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addServer(stagePrefix)
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Define el path exacto de Swagger
  SwaggerModule.setup('dev/api', app, document); // La documentación estará disponible en /api

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  if (event.path === '' || event.path === undefined) event.path = '/';

  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

if (process.env.IS_OFFLINE) {
  bootstrap()
    .then(() => console.log('Server is running locally with Swagger enabled'))
    .catch((err) => console.error('Error bootstrapping the app:', err));
}
