import { ReadRemoteFileByLine } from "./ReadRemoteFileByLine";

const fs = require('fs');
const http = require("http");
jest.mock('fs');
jest.mock('http');

describe("Test ReadRemoteFileByLine" , () => { 
    describe("Test ReadRemoteFileByLine constructor " , () => { 

        it("Create an instance 1" , () => { 
            let readRemoteFileByLine = new ReadRemoteFileByLine("http://SomeFileURL" );
            expect(readRemoteFileByLine.url).toEqual("http://SomeFileURL");
            expect(readRemoteFileByLine.saveFilePath).toEqual(__dirname + "/rrbl.txt");
            expect(readRemoteFileByLine.index).toEqual(0);
        });

        it("Create an instance 2" , () => { 
            let readRemoteFileByLine = new ReadRemoteFileByLine("http://SomeFileURL" , "Some file location");
            expect(readRemoteFileByLine.url).toEqual("http://SomeFileURL");
            expect(readRemoteFileByLine.saveFilePath).toEqual( "Some file location");
            expect(readRemoteFileByLine.index).toEqual(0);
        });

        
    });

    describe("Test ReadRemoteFileByLine.readFile " , () => { 

        it("Test 1" , () => { 
            let readRemoteFileByLine = new ReadRemoteFileByLine("http://SomeFileURL" );
            fs.createWriteStream = jest.fn(() => { 
                return { on : jest.fn()};
            });
            expect(readRemoteFileByLine.readByLine()).resolves;
            expect(fs.createWriteStream).toHaveBeenCalledTimes(1);
            expect(fs.createWriteStream).toHaveBeenCalledWith(__dirname + "/rrbl.txt");
            expect(http.get).toHaveBeenCalledTimes(1);
            
        });
    });
});