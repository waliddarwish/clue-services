import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentRetrieverModule } from './document-retrierver.module';
import { DocumentRetrieverService } from './document-retriever.service';



async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    DocumentRetrieverModule,
    new FastifyAdapter(),
  );
  app.get(DocumentRetrieverModule).register(app, 'document-retriever' , app.get(DocumentRetrieverService) , true , 'documents' , 'document-owner' , '4lzahraa2' , 'documents');
}
bootstrap();
