import mongoose = require('mongoose');
import config = require('config/config.json');

const mongoSeeds = config.catalogs.catalogConfig.mongoConfig.hosts;
let mongoURI = 'mongodb://catalog-owner:4lzahraa2@' ;

for (const entry of mongoSeeds) {
  mongoURI += entry.host + ':' + entry.port + ',';
}

mongoURI = mongoURI.substring(0, mongoURI.length - 1) + '/catalog?authSource=catalog';

mongoose.connection.on('connected', () => {
  console.log('Connected to Catalog');
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Catalog');
});

mongoose.connection.on('reconnected', () => {
  console.log('Reconnected to Catalog');
});

mongoose.connection.on('close', () => {
  console.log('Catalog connection closed' );
});

mongoose.connection.on('error', () => {
  console.log('Catalog connection error' );
});


async function connectToMongoose() {
  let mongooseConnection = await mongoose.connect(mongoURI ,
    { useNewUrlParser: true, 
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
    (error) => {
      if (error) {
        console.log("Error Connecting to Catalog: Retrying ...");
        console.log(error);
        setTimeout(connectToMongoose , config.catalogs.initialConnectionRetryInterval);
      }
    });
    
    
    return mongooseConnection;
}
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
     let connection = await  connectToMongoose();
     return connection;
    }
  },
];
