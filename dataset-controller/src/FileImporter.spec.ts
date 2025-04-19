import { Test } from '@nestjs/testing';
import { FileImporter } from './FileImporter';
import { async } from 'rxjs/internal/scheduler/async';
import { DateValidatior } from './validator/DateValidator';
import { TimeStampValidatior } from './validator/TimeStampeValidator';
import { NumberValidator } from './validator/NumberValidator';
import { time } from 'console';
const HashMap = require('hashmap');
const CSV = require("csv-string");

describe('Test dataset File importer', () => {
    let fileImporter;
    let extractDataTypesMocked;
    let extractStrictQuotesMocked;
    let extractDelimeterMocked;
    let calculteCellDataTypePercentMocked;
    let electCellDataTypeMocked;
    let sanitizeStringMocked;

    
    let extractDataTypesOriginal = FileImporter.prototype.extractDataTypes;
    let extractStrictQuotesOriginal = FileImporter.prototype.extractStrictQuotes;
    let extractDelimeterOriginal = FileImporter.prototype.extractDelimeter;
    let calculteCellDataTypePercentOriginal = FileImporter.prototype.calculteCellDataTypePercent;
    let electCellDataTypeOriginal = FileImporter.prototype.electCellDataType;
    let sanitizeStringOriginal = FileImporter.prototype.sanitizeString


    describe('Test FileImporter.buildTableStructure', () => {
        let sampleLines = [];
        let fileUrl = 'dummy/yummy.csv';
        let tableName = 'Thanos';
        const delimeter = ',';
        const strictQuoteValueOn = 'ON';
        const strictQuoteValueOff = 'OFF';
        let columnInfoMap = new HashMap();
        columnInfoMap.set('1', {electedHeaderName: 'header1', electedType: 'number'});
        columnInfoMap.set('2', {electedHeaderName: 'header2', electedType: 'string'});

        beforeEach(async () => {
            jest.resetAllMocks();
            fileImporter = new FileImporter();
            extractDelimeterMocked = FileImporter.prototype.extractDelimeter = jest.fn();
            extractDelimeterMocked.mockImplementationOnce(() => delimeter);

            extractStrictQuotesMocked = FileImporter.prototype.extractStrictQuotes = jest.fn();
            extractStrictQuotesMocked.mockImplementationOnce(() => strictQuoteValueOn);

            extractDataTypesMocked = FileImporter.prototype.extractDataTypes = jest.fn();
            extractDataTypesMocked.mockImplementationOnce(() => columnInfoMap);

        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            FileImporter.prototype.extractDelimeter = extractDelimeterOriginal;
            FileImporter.prototype.extractStrictQuotes = extractStrictQuotesOriginal;
            FileImporter.prototype.extractDataTypes = extractDataTypesOriginal;
        });

        it('Build table structure successfully', ()=> {
            let expectedResult = {
                importStatement: "IMPORT TABLE Thanos (header1 number, header2 string)  CSV DATA ('dummy/yummy.csv') WITH delimiter = ',' ;",
                createTableStatement: 'CREATE TABLE IF NOT EXISTS Thanos (header1 number, header2 string); '
            };
            let result = fileImporter.buildTableStructure(sampleLines, fileUrl, tableName);
            expect(result).toEqual(expectedResult);
        });

        it('Build table structure successfully with skip headers', ()=> {
            let columnInfoMap = new HashMap();
            columnInfoMap.set('1', {electedHeaderName: 'header1', electedType: 'number', skipHeader: 1});
            columnInfoMap.set('2', {electedHeaderName: 'header2', electedType: 'string', skipHeader: 1});
            extractDataTypesMocked = FileImporter.prototype.extractDataTypes = jest.fn();
            extractDataTypesMocked.mockImplementationOnce(() => columnInfoMap);

            let expectedResult = {
                importStatement: "IMPORT TABLE Thanos (header1 number, header2 string)  CSV DATA ('dummy/yummy.csv') WITH delimiter = ',' , skip = '1' ;",
                createTableStatement: 'CREATE TABLE IF NOT EXISTS Thanos (header1 number, header2 string); '
              };
        
            let result = fileImporter.buildTableStructure(sampleLines, fileUrl, tableName);
            expect(result).toEqual(expectedResult);
        });

    });

    describe('Test FileImporter.extractDataTypes', () => {

        const delimeter = ',';

        beforeEach(async () => {
            jest.clearAllMocks();
            jest.resetAllMocks();

            jest.genMockFromModule('csv-string');
            jest.mock('csv-string');
            CSV.parse = jest.fn();

            calculteCellDataTypePercentMocked = FileImporter.prototype.calculteCellDataTypePercent = jest.fn();
            electCellDataTypeMocked = FileImporter.prototype.electCellDataType = jest.fn();
            sanitizeStringMocked = FileImporter.prototype.sanitizeString = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            FileImporter.prototype.calculteCellDataTypePercent = calculteCellDataTypePercentOriginal;
            FileImporter.prototype.electCellDataType = electCellDataTypeOriginal;
            FileImporter.prototype.sanitizeString = sanitizeStringOriginal;
        });

        it('Extract string data types successfully', ()=> {
            let sampleLines = [
                "header1, header2, header3",
                "test1, test2, test3",
            ];
            let expectedResult = {"_data":{"1":[1,{"suggestedHeader":"header1","dateIndex":0,"timeStampIndex":0,"numberIndex":0,"stringIndex":1,"electedHeaderName":"header1"}],"2":[2,{"suggestedHeader":"header2","dateIndex":0,"timeStampIndex":0,"numberIndex":0,"stringIndex":1,"electedHeaderName":"header2"}],"3":[3,{"suggestedHeader":"header3","dateIndex":0,"timeStampIndex":0,"numberIndex":0,"stringIndex":1,"electedHeaderName":"header3"}]},"size":3};

            CSV.parse.mockReturnValueOnce([["header1", "header2", "header3"]])
                .mockReturnValueOnce([["test1", "test2", "test3"]]);
            
            calculteCellDataTypePercentMocked.mockReturnValueOnce({ suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 })
                .mockReturnValueOnce({ suggestedHeader: "header2", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 })
                .mockReturnValueOnce({ suggestedHeader: "header3", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 })
                .mockReturnValueOnce({ suggestedHeader: "test1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 })
                .mockReturnValueOnce({ suggestedHeader: "test2", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 })
                .mockReturnValueOnce({ suggestedHeader: "test3", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 });
            
            
                electCellDataTypeMocked.mockReturnValueOnce({ suggestedHeader: "test1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                .mockReturnValueOnce({ suggestedHeader: "test2", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                .mockReturnValueOnce({ suggestedHeader: "test3", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                .mockReturnValueOnce({ suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                .mockReturnValueOnce({ suggestedHeader: "header2", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                .mockReturnValueOnce({ suggestedHeader: "header3", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
            
            
                sanitizeStringMocked.mockReturnValueOnce('header1')
                .mockReturnValueOnce('header2')
                .mockReturnValueOnce('header3');

            let result = fileImporter.extractDataTypes(sampleLines, delimeter);
            expect(result).toEqual(expectedResult);

            expect(CSV.parse).toHaveBeenCalledTimes(2);
            expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
            expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);

            expect(calculteCellDataTypePercentMocked).toHaveBeenCalledTimes(6);
            expect(electCellDataTypeMocked).toHaveBeenCalledTimes(6);
            expect(sanitizeStringMocked).toHaveBeenCalledTimes(3);

            });

            it('Extract number data types successfully', ()=> {
                let sampleLines = [
                    "header1, header2, header3",
                    "test1, test2, test3",
                ];
                let expectedResult = {"_data":{"1":[1,{"suggestedHeader":"header1","dateIndex":0,"timeStampIndex":0,"numberIndex":1,"stringIndex":0,"electedHeaderName":"header1"}],"2":[2,{"suggestedHeader":"header2","dateIndex":0,"timeStampIndex":0,"numberIndex":1,"stringIndex":0,"electedHeaderName":"header2"}],"3":[3,{"suggestedHeader":"header3","dateIndex":0,"timeStampIndex":0,"numberIndex":1,"stringIndex":0,"electedHeaderName":"header3"}]},"size":3};
    
                CSV.parse.mockReturnValueOnce([["header1", "header2", "header3"]])
                    .mockReturnValueOnce([["test1", "test2", "test3"]]);
                
                calculteCellDataTypePercentMocked.mockReturnValueOnce({ suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 })
                    .mockReturnValueOnce({ suggestedHeader: "header2", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 })
                    .mockReturnValueOnce({ suggestedHeader: "header3", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 })
                    .mockReturnValueOnce({ suggestedHeader: "test1", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 })
                    .mockReturnValueOnce({ suggestedHeader: "test2", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 })
                    .mockReturnValueOnce({ suggestedHeader: "test3", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 });
                
                
                    electCellDataTypeMocked.mockReturnValueOnce({ suggestedHeader: "test1", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 , electedType: 'Number', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 100, stringMatchPercent: 0})
                    .mockReturnValueOnce({ suggestedHeader: "test2", dateIndex: 0, timeStampIndex: 0, numberIndex: 1, stringIndex: 0 , electedType: 'Number', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 100, stringMatchPercent: 0})
                    .mockReturnValueOnce({ suggestedHeader: "test3", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Number', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 100, stringMatchPercent: 0})
                    .mockReturnValueOnce({ suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                    .mockReturnValueOnce({ suggestedHeader: "header2", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                    .mockReturnValueOnce({ suggestedHeader: "header3", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 1 , electedType: 'Text', dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100})
                
                
                    sanitizeStringMocked.mockReturnValueOnce('header1')
                    .mockReturnValueOnce('header2')
                    .mockReturnValueOnce('header3');
    
                let result = fileImporter.extractDataTypes(sampleLines, delimeter);
                expect(result).toEqual(expectedResult);
    
                expect(CSV.parse).toHaveBeenCalledTimes(2);
                expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
                expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);
    
                expect(calculteCellDataTypePercentMocked).toHaveBeenCalledTimes(6);
                expect(electCellDataTypeMocked).toHaveBeenCalledTimes(6);
                expect(sanitizeStringMocked).toHaveBeenCalledTimes(3);
    
                });

                it('Extract date data types successfully', ()=> {
                    let sampleLines = [
                        "header1, header2, header3",
                        "1596408779323, 1596408779323, 1596408779323",
                    ];
                    let expectedResult = {"_data":{"1":[1,{"suggestedHeader":"header1","dateIndex":1,"timeStampIndex":0,"numberIndex":0,"stringIndex":0,"electedHeaderName":"header1"}],"2":[2,{"suggestedHeader":"header2","dateIndex":1,"timeStampIndex":0,"numberIndex":0,"stringIndex":0,"electedHeaderName":"header2"}],"3":[3,{"suggestedHeader":"header3","dateIndex":1,"timeStampIndex":0,"numberIndex":0,"stringIndex":0,"electedHeaderName":"header3"}]},"size":3};
        
                    CSV.parse.mockReturnValueOnce([["header1", "header2", "header3"]])
                        .mockReturnValueOnce([["1596408779323", "1596408779323", "1596408779323"]]);
                    


                    calculteCellDataTypePercentMocked.mockReturnValueOnce({"suggestedHeader":"header1","dateIndex":1,"timeStampIndex":0,"numberIndex":0,"stringIndex":0})
                    .mockReturnValueOnce({"suggestedHeader":"header2","dateIndex":1,"timeStampIndex":0,"numberIndex":0,"stringIndex":0})
                    .mockReturnValueOnce({"suggestedHeader":"header3","dateIndex":1,"timeStampIndex":0,"numberIndex":0,"stringIndex":0});

                    electCellDataTypeMocked.mockReturnValueOnce({suggestedHeader:"header1",dateIndex:1,timeStampIndex:0,numberIndex:0,stringIndex:0, electedType: "Date", dateMatchPercent: 100, timeStampMatchPercent: 0, numberMatchPercent: 0 , stringMatchPercent: 0})
                    .mockReturnValueOnce({suggestedHeader:"header2",dateIndex:1,timeStampIndex:0,numberIndex:0,stringIndex:0, electedType: "Date", dateMatchPercent: 100, timeStampMatchPercent: 0, numberMatchPercent: 0 , stringMatchPercent: 0})
                    .mockReturnValueOnce({suggestedHeader:"header3",dateIndex:1,"timeStampIndex":0,numberIndex:0,stringIndex:0, electedType: "Date", dateMatchPercent: 100, timeStampMatchPercent: 0, numberMatchPercent: 0 , stringMatchPercent: 0});   

                    
                    calculteCellDataTypePercentMocked.mockReturnValueOnce({"suggestedHeader":"header1","dateIndex":0,"timeStampIndex":0,"numberIndex":0,"stringIndex":1})
                    .mockReturnValueOnce({"suggestedHeader":"header2","dateIndex":0,"timeStampIndex":0,"numberIndex":0,"stringIndex":1})
                    .mockReturnValueOnce({"suggestedHeader":"header3","dateIndex":0,"timeStampIndex":0,"numberIndex":0,"stringIndex":1});

                    electCellDataTypeMocked.mockReturnValueOnce({suggestedHeader:"header1",dateIndex:0,timeStampIndex:0, numberIndex:0,stringIndex:1, electedType: "Text", dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0 , stringMatchPercent: 100})
                    .mockReturnValueOnce({suggestedHeader:"header2",dateIndex:0,timeStampIndex:0,numberIndex:0,stringIndex:1, electedType: "Text", dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0 , stringMatchPercent: 100})
                    .mockReturnValueOnce({suggestedHeader:"header3",dateIndex:0,timeStampIndex:0,numberIndex:0,stringIndex:1, electedType: "Text", dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0 , stringMatchPercent: 100});   
                    
                    sanitizeStringMocked.mockReturnValueOnce('header1')
                    .mockReturnValueOnce('header2')
                    .mockReturnValueOnce('header3');
        
                    let result = fileImporter.extractDataTypes(sampleLines, delimeter);
                    expect(result).toEqual(expectedResult);
        
                    expect(CSV.parse).toHaveBeenCalledTimes(2);
                    expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
                    expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);
        
                    expect(calculteCellDataTypePercentMocked).toHaveBeenCalledTimes(6);
                    expect(electCellDataTypeMocked).toHaveBeenCalledTimes(6);
                    expect(sanitizeStringMocked).toHaveBeenCalledTimes(3);
        
                    });


    });


    describe('Test FileImporter.electCellDataType', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            fileImporter = new FileImporter();
        });

        it ('Elect string datatype', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 10, electedType: "Text", dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100 };
            let sampleSize = 10;
            let expectedResult = {
                suggestedHeader: 'header1',
                dateIndex: 0,
                timeStampIndex: 0,
                numberIndex: 0,
                stringIndex: 10,
                electedType: 'Text',
                dateMatchPercent: 0,
                timeStampMatchPercent: 0,
                numberMatchPercent: 0,
                stringMatchPercent: 100
              };

            let result = fileImporter.electCellDataType(columnInfo,  sampleSize);
            expect(result).toEqual(expectedResult);
        });

        it ('Elect Number datatype', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 10, stringIndex: 0, electedType: "Number", dateMatchPercent: 0, timeStampMatchPercent: 0, numberMatchPercent: 0, stringMatchPercent: 100 };
            let sampleSize = 10;
            let expectedResult =  {
                suggestedHeader: 'header1',
                dateIndex: 0,
                timeStampIndex: 0,
                numberIndex: 10,
                stringIndex: 0,
                electedType: 'Number',
                dateMatchPercent: 0,
                timeStampMatchPercent: 0,
                numberMatchPercent: 100,
                stringMatchPercent: 0
              };

            let result = fileImporter.electCellDataType(columnInfo,  sampleSize);
            expect(result).toEqual(expectedResult);
        });

        it ('Elect timestamp datatype. Time stamp index is higher than number index', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 1, timeStampIndex: 10, numberIndex: 9, stringIndex: 0 };
            let sampleSize = 10;
            let expectedResult = {
                suggestedHeader: 'header1',
                dateIndex: 1,
                timeStampIndex: 10,
                numberIndex: 9,
                stringIndex: 0,
                electedType: 'Timestamp',
                dateMatchPercent: 10,
                timeStampMatchPercent: 100,
                numberMatchPercent: 90,
                stringMatchPercent: 0
              };

            let result = fileImporter.electCellDataType(columnInfo,  sampleSize);
            expect(result).toEqual(expectedResult);
        });


        it ('Elect Date datatype. Date index is more than  number index', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 9, timeStampIndex: 3, numberIndex: 2, stringIndex: 1 };
            let sampleSize = 10;
            let expectedResult = {
                suggestedHeader: 'header1',
                dateIndex: 9,
                timeStampIndex: 3,
                numberIndex: 2,
                stringIndex: 1,
                electedType: 'Date',
                dateMatchPercent: 90,
                timeStampMatchPercent: 30,
                numberMatchPercent: 20,
                stringMatchPercent: 10
              };

            let result = fileImporter.electCellDataType(columnInfo,  sampleSize);
            expect(result).toEqual(expectedResult);
        });


    });
    

    describe('Test FileImporter.calculteCellDataTypePercent', () => {
        let dateValidator = new DateValidatior();
        let timeStampValidator = new TimeStampValidatior();
        let numberValidator = new NumberValidator();

        beforeEach(async () => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            fileImporter = new FileImporter();
            calculteCellDataTypePercentMocked = calculteCellDataTypePercentOriginal;
        });

        it ('calculteCellDataTypePercent for string', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 0 };
            let cell = 'test3';
            let expectedResult = {
                suggestedHeader: 'header1',
                dateIndex: 0,
                timeStampIndex: 0,
                numberIndex: 0,
                stringIndex: 1
              };
            
            let result = fileImporter.calculteCellDataTypePercent(cell, columnInfo, dateValidator, timeStampValidator, numberValidator);
            expect(result).toEqual(expectedResult);
        });

        it ('calculteCellDataTypePercent for number', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 0 };
            let cell = '10';
            let expectedResult = {
                suggestedHeader: 'header1',
                dateIndex: 1,
                timeStampIndex: 0,
                numberIndex: 1,
                stringIndex: 0
              };
            
            let result = fileImporter.calculteCellDataTypePercent(cell, columnInfo, dateValidator, timeStampValidator, numberValidator);
            expect(result).toEqual(expectedResult);
        });
        
        it ('calculteCellDataTypePercent for timestamp', () =>{
            let columnInfo = { suggestedHeader: "header1", dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 0 };
            let cell = '1539010429';
            let expectedResult = {
                suggestedHeader: 'header1',
                dateIndex: 0,
                timeStampIndex: 0,
                numberIndex: 1,
                stringIndex: 0
              };
            
            let result = fileImporter.calculteCellDataTypePercent(cell, columnInfo, dateValidator, timeStampValidator, numberValidator);
            expect(result).toEqual(expectedResult);
        });

    });



    describe('Test FileImporter.extractDelimeter', () => {

        let sampleLines = [
            "header1, header2, header3",
            "firstrow1, firstrow2, firstrow3",
            "secondrow1, secondrow2, secondrow3",
        ];
        beforeEach(async () => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            fileImporter = new FileImporter();
            jest.genMockFromModule('csv-string');
            jest.mock('csv-string');
            CSV.parse = jest.fn();
            CSV.detect = jest.fn();
        });

        it ('extractDelimeter successfully', () =>{
            let delimeter = ',';
            CSV.detect.mockReturnValue(delimeter);

            CSV.parse.mockReturnValueOnce([["header1", "header2", "header3"]])
                .mockReturnValueOnce([["firstrow1", "firstrow2", "firstrow3"]])
                .mockReturnValueOnce([["secondrow1", "secondrow2", "secondrow3"]]);

            let result = fileImporter.extractDelimeter(sampleLines);
            expect(result).toEqual(delimeter);
            expect(CSV.detect).toBeCalledTimes(3);

            expect(CSV.parse).toBeCalledTimes(3);
            expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
            expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);
            expect(CSV.parse.mock.calls[2][0]).toBe(sampleLines[2]);
            
        });

        it ('extractDelimeter fail', () =>{
            let delimeter = ',';
            CSV.detect.mockReturnValueOnce(',').mockReturnValueOnce('#').mockReturnValueOnce('@');

            CSV.parse.mockReturnValueOnce([["header1", "header2", "header3"]])
                .mockReturnValueOnce([["firstrow1", "firstrow2", "firstrow3"]])
                .mockReturnValueOnce([["secondrow1", "secondrow2", "secondrow3"]]);

            expect(() => { fileImporter.extractDelimeter(sampleLines) }).toThrow(new Error('Electing delimeter failed. Match percentage is: 33.333333333333336 for: [,]'));
            expect(CSV.detect).toBeCalledTimes(3);

            expect(CSV.parse).toBeCalledTimes(3);
            expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
            expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);
            expect(CSV.parse.mock.calls[2][0]).toBe(sampleLines[2]);
            
        });
    });


    describe('Test FileImporter.extractStrictQuotes', () => {

        let sampleLines = [
            "header1, header2, header3",
            "firstrow1, firstrow2, firstrow3",
            "secondrow1, secondrow2, secondrow3",
        ];
        beforeEach(async () => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            fileImporter = new FileImporter();
            jest.genMockFromModule('csv-string');
            jest.mock('csv-string');
            CSV.parse = jest.fn();

        });

        it ('extractStrictQuotes less than 90% successfully', () =>{
            CSV.parse.mockReturnValueOnce([["header1", "header2", "header3"]])
                .mockReturnValueOnce([["firstrow1\"", "\"firstrow2", "firstrow3\""]])
                .mockReturnValueOnce([["\"secondrow1", "\"secondrow2", "secondrow3\""]]);


            let result = fileImporter.extractStrictQuotes(sampleLines, ',');
            expect(result).toEqual('OFF');
            expect(CSV.parse).toBeCalledTimes(3);
            expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
            expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);
            expect(CSV.parse.mock.calls[2][0]).toBe(sampleLines[2]);
        });

        it ('extractStrictQuotes more than 90% successfully', () =>{
            let sampleLines = [
                "header1, header2, header3",
                "firstrow1, firstrow2, firstrow3",
                "secondrow1, secondrow2, secondrow3",
                "thirdrow1, thirdrow2, thirdrow3",
            ];

            CSV.parse.mockReturnValueOnce([['"header1"', '"header2"', '"header3"']])
                .mockReturnValueOnce([['"firstrow1"', '"firstrow2"', '"firstrow3"']])
                .mockReturnValueOnce([['"secondrow1"', '"secondrow2"', '"secondrow3"']])
                .mockReturnValueOnce([['"thirdrow1"', '"thirdrow2"', '"thirdrow3"']]);


            let result = fileImporter.extractStrictQuotes(sampleLines, ',');
            expect(result).toEqual('ON');
            expect(CSV.parse).toBeCalledTimes(4);
            expect(CSV.parse.mock.calls[0][0]).toBe(sampleLines[0]);
            expect(CSV.parse.mock.calls[1][0]).toBe(sampleLines[1]);
            expect(CSV.parse.mock.calls[2][0]).toBe(sampleLines[2]);
        });

    });
});