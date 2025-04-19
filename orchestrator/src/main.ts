
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { OrchModule } from './orch.module';
import { ValidationPipe, Logger } from '@nestjs/common';

// tslint:disable-next-line:no-var-requires
import fastifySession = require('fastify-session');
import fastifyCookie = require('fastify-cookie');


import orchConfig = require('config/config.json');
import { NodeObject } from '../../object-schema/src/schemas/catalog.node';
import { OrchService } from './orch.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SessionGuard } from './orch.session-guard';
import { CatalogModule } from '../../catalog-module/src/catalog.module';
import { GlobalAppContext } from '../../app-module/src/app.context';
import helmet = require('helmet');
let logger = new Logger('Orchestrator');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    OrchModule,
    new FastifyAdapter(),
  );
  GlobalAppContext.setContext('app', app);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());

  app.enableCors({ credentials: true, origin: true });
  app.useGlobalGuards(new SessionGuard());

  const fastifyEngine = app.getHttpAdapter().getInstance();
  const limitProtectedRoutes = ['/invitation/send-email'];

  fastifyEngine.register(fastifyCookie);
  let RedisStore = require('connect-redis')(fastifySession);
  const redis = require('redis');
  let redisClient = redis.createClient({
    host: 'redis-master-node',
    port: 9700,
    password: '4lzahraa2'
  });
  
  fastifyEngine.register(fastifySession, {
    cookieName: 'saSessionId',
    secret: 'S!mpleAn@lyticsR0cksAndWeL0ve!t!2019',
    store: new RedisStore({ client: redisClient }),
    cookie: { secure: false },
    expires: orchConfig.orchConfig.sessionMaxLiveMilliseconds,
  });
  
  fastifyEngine.register(require('fastify-rate-limit'), {
    keyGenerator: (req) => {
      return req.headers['x-real-ip'] // nginx
      || req.headers['x-client-ip'] // apache
      || req.session.username // you can limit based on any session value
      || req.raw.ip; // fallback to default
  },
  max: 2,
  timeWindow: 15000,
  onExceeding: () => {
    logger.log('callback on exceeding ... executed before response to client');
  },
  onExceeded: () => {
    logger.log('callback on exceeded ... to black ip in security group for example, req is give as argument');
  },
 
  whitelist: (req, key) => {
    return !limitProtectedRoutes.includes(req.raw.url);
  },

});

  const orchService: OrchService = app.get(OrchService);
  const thisOrchestrator = new NodeObject();
  thisOrchestrator.port = orchConfig.orchConfig.saPort;
  thisOrchestrator.server = orchConfig.orchConfig.privateInterface;
  thisOrchestrator.config = orchConfig.orchConfig;

  if (orchConfig.orchConfig.saAppMode === 'dev') {

    const options = new DocumentBuilder()
      .setTitle('Orchestrator')
      .setDescription('Orchestrator API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options, { deepScanRoutes: true, include: [OrchModule, CatalogModule] });
    SwaggerModule.setup('api', app, document, { customSiteTitle: 'Clue Analytics API' });
  }
  app.listen(orchConfig.orchConfig.saPort , '0.0.0.0');


}

bootstrap();
