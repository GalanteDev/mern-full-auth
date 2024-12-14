import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

let server: Handler;

async function bootstrap(): Promise<Handler | void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'], // Logs detallados
  });

  // Middleware de cookies
  app.use(cookieParser());

  // Configuración de CORS
  app.enableCors({
    origin: process.env.IS_OFFLINE
      ? 'http://localhost:3000' // Entorno local
      : 'https://tu-dominio-produccion.com', // Cambiar según tu dominio en producción
    credentials: true,
  });

  // Inicializar la aplicación
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

// Modo producción: Exporta el handler para AWS Lambda
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  if (event.path === '' || event.path === undefined) event.path = '/';

  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

// Modo desarrollo: Ejecuta la app localmente si `IS_OFFLINE` está activado
if (process.env.IS_OFFLINE) {
  bootstrap()
    // eslint-disable-next-line no-console
    .then(() => console.log('Server is running in offline mode'))
    // eslint-disable-next-line no-console
    .catch((err) => console.error('Error bootstrapping the app:', err));
}
