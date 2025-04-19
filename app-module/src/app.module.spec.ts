jest.setMock('../config/config.json', {});

import { AppModule } from "./app.module";

const config = {
    port: 99999,
    catalogs : {
        hosts: []
    }

};

const mongoose =  {
    connect : jest.fn( () => 
    { console.log('Inside Mongoose connect')})
}; 

describe('Test AppModule' , () => { 
    let appModule;
    const appMock = {
        listen: jest.fn(() => Promise.resolve({ data: {} })),
        useGlobalPipes:  jest.fn(),
        enableCors: jest.fn()
    }

    beforeEach( async () => { 
        appModule = new AppModule();
        
    });

    it('AppModule.register() without database connection ' , async () =>  { 
        await appModule.register(appMock, 'someapp' );
        expect(appMock.useGlobalPipes).toHaveBeenCalled();
        expect(appMock.enableCors).toHaveBeenCalled();
        expect(appMock.listen).toHaveBeenCalled();
        
    });

    it('AppModule.connectionToDatabase() ' , async () =>  { 
        appModule.connectToDatabase(config, mongoose);
        expect(mongoose.connect).toHaveBeenCalled()
    });





})