import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { AppModule } from '../../app-module/src/app.module';
import { ObjectSchemaModule } from '../../object-schema/src/object-schema.module';
import { LogService } from '../../log-module/src/log.service';
import { GlobalizationService } from '../../globalization-module/src/globalization.service';
import Agenda = require('agenda');
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';
import { MongoClient } from 'mongodb';

let theAgenda;
@Module({
  imports: [
    forwardRef(() => HttpModule),
    HttpModule,
    ObjectSchemaModule,
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService, GlobalizationService, LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class SchedulerModule extends AppModule {

  async configureAgenda(nodeConfig: any, schedulerService: SchedulerService): Promise<any> {
    //mongodb://username:password@host:port/database
    let mongoConnectionString =
      'mongodb://' +
      nodeConfig.user +
      ':' +
      nodeConfig.pwd +
      '@';
    for (const entry of nodeConfig.catalogs.hosts) {

      mongoConnectionString += entry.host + ':' + entry.port + ',';
    }

    mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1) + '/' + nodeConfig.schema;

    mongoConnectionString += '?authSource=agenda';
    let that = this;
      MongoClient.connect(
        mongoConnectionString,
        {
          useNewUrlParser: true,
          useUnifiedTopology: false,
          autoReconnect: true,
          connectTimeoutMS: nodeConfig.catalogs.connectTimeoutMS,
          socketTimeoutMS: nodeConfig.catalogs.socketTimeoutMS,
          poolSize: nodeConfig.catalogs.poolSize,
          reconnectInterval: nodeConfig.catalogs.reconnectInterval,
          reconnectTries: nodeConfig.catalogs.reconnectTries,
        },
        function (error, result) {
          if (error) {
            console.log("Agenda: Error connecting to mongodb ... retrying");
            setTimeout(function() { 
              that.configureAgenda(nodeConfig , schedulerService);
            } , nodeConfig.catalogs.initialConnectionRetryInterval);
          } else {
            const agenda = new Agenda({
                mongo: result.db('agenda'),
            }, () => {
              console.log('Agenda scheduler started');
              schedulerService.setAgenda(agenda);
              schedulerService.initSystemTasks();
            });
            theAgenda = agenda;
            process.on('SIGTERM', that.graceful);
            process.on('SIGINT', that.graceful);
          }
        }
      )
   

  }

  graceful(): void {
    console.log('Gracefully stopping agenda scheduler');
    theAgenda.stop();
    process.exit(0);
  }

}
