import { Module, HttpModule, INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { GlobalAppContext } from './app.context';
import { LogModule } from '../../log-module/src/log.module';

let config;
try { 
   config = require('config/config.json') 
} catch (e) {
  config = {}
}

const logger = new Logger('ClueCatalogLogs')
mongoose.connection.on('connected', () => {
  logger.log('Connected to Catalog');
});

mongoose.connection.on('disconnected', () => {
  logger.log('Disconnected from Catalog');
});

mongoose.connection.on('reconnected', () => {
  logger.log('Reconnected to Catalog');
});

mongoose.connection.on('close', () => {
  logger.log('Catalog connection closed');
});

mongoose.connection.on('error', () => {
  logger.log('Catalog connection error');
});


@Module({
  imports: [HttpModule, LogModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  private connection;
  private mongooseMongoURI = "";
  private username;
  private password;
  private service;
  private authSource;
  private databaseName;

  async register(app: INestApplication, type: string, service?: any,
    databaseConnect?: boolean, databaseName?: string, username?: string, password?: string, authSource?: string): Promise<any> {
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    this.username = username;
    this.password = password;
    this.service = service;
    this.databaseName = databaseName;
    this.authSource = authSource;

    GlobalAppContext.setContext('app', app);
    if (databaseConnect) {
      this.connection = await this.connectToDatabase(config , mongoose);
    }
    app.listen(config.port, '0.0.0.0').catch(
      (error) => {
        // tslint:disable-next-line: no-console
        logger.error(error);
        process.exit(1);
      }
    );

    return config;

  }



   async connectToDatabase(config , mongoose) {
    const mongoSeeds = config.catalogs.hosts;
    this.mongooseMongoURI = 'mongodb://' + (this.username ? (this.username + ':') : '') + (this.password ? (this.password + '@') : '');
    for (const entry of mongoSeeds) {
      this.mongooseMongoURI += entry.host + ':' + entry.port + ',';
    }
    this.mongooseMongoURI = this.mongooseMongoURI.substring(0, this.mongooseMongoURI.length - 1) + '/' + this.databaseName
      + (this.authSource ? ('?authSource=' + this.authSource) : '');

    this.connection = await mongoose.connect(this.mongooseMongoURI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: false,
      useCreateIndex: true,
      autoReconnect: true,
      connectTimeoutMS: config.catalogs.connectTimeoutMS,
      socketTimeoutMS: config.catalogs.socketTimeoutMS,
      poolSize: config.catalogs.poolSize,
      reconnectInterval: config.catalogs.reconnectInterval,
      reconnectTries: config.catalogs.reconnectTries,
    },
      (error , result) => {
        if (error) {
          logger.error("Error Connecting to Catalog: Retrying ...");
          logger.error(error);
          const that = this;
          setTimeout(function() { 
          that.connectToDatabase(config , mongoose) } , config.catalogs.initialConnectionRetryInterval);

        } else { this.service.initService(result)}
      });
  }

}
