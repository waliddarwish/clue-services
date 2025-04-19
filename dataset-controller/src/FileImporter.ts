import { DateValidatior } from './validator/DateValidator';
import { TimeStampValidatior } from './validator/TimeStampeValidator';
import { NumberValidator } from './validator/NumberValidator';
const CSV = require("csv-string");
const HashMap = require('hashmap');
const stringSanitizer = require("string-sanitizer");



const COMMA_DELIMITER = ',';
const TAB_DELIMITER = '\t';
const SEMI_COLONS_DELIMITER = ';';
const PIPE_DELIMITER = '|';
const CARET_DELIMITER = '^';
const PLUS_OPERATOR = '+';

const DATA_TYPE_STRING = 'Text';
const DATA_TYPE_DATE = 'Date';
const DATA_TYPE_NUMERIC = 'Number';
const DATA_TYPE_TIMESTAMP = 'Timestamp';


export class FileImporter {


    /**
     * importDatasetFile design assumptions: 
     * 
     * 1. Supported format is CSV format. 
     * 2. Connection between clueDFS and datastore is plain HTTP. For now!
     * 3. Import options: 
     *    a. delimiter: Will be set to ',' by default. supported delimiters are (tabs, semi-colons, pipes, carets)
     *    b. comment: Do we need to support this ? not for the demo!
     *    c. strict_quotes: use the default value for now (off). Later on, we will need to examine the file and try to figure out the correct value.
     *    d. experimental_save_rejected: use the default value for now (off). Later on, we will set it to true and move the file back to the DFS to notify the user. 
     *    e. nullif: not supported for now.
     *    f. skip: Set to default value for now (0). Should this be a user input?
     *    g. decompress: Use the default value (auto). 
     * 4. Import stats are required: Total number of rows, successful ones, failed ones, time it took.
     * 5. Rejected file will be uploaded to the DFS and dataset datafile will be updated. 
     * 6. We need an algorithm to figure out the csv file structure: 
     *    a. Read the first x lines. 
     *    b. Try to figure out the delimiter. 
     *    c. Try to figure out if the first row is the header or not. 
     *    e. Try to figure out the correct data type for each column. 
     *    f. Use the output to build the table structure.   
     * 
     * 
     * @param sampleLines 
     * 1. Extract delimeter
     * 2. build table structure
     */
    buildTableStructure(sampleLines: [], fileUrl: string, tableName: string): any {
        const delimeter = this.extractDelimeter(sampleLines);
        const strictQuoteValue = this.extractStrictQuotes(sampleLines, delimeter);
        let columnInfoMap = new HashMap();
        columnInfoMap = this.extractDataTypes(sampleLines, delimeter);

        let createTableStatement = 'CREATE TABLE IF NOT EXISTS ';
        createTableStatement += tableName + ' ';
        createTableStatement += '(';
        for (const columnPair of columnInfoMap) {
            const columnInfo = columnPair.value;
            createTableStatement += columnInfo.electedHeaderName;
            createTableStatement += ' ';
            createTableStatement += columnInfo.electedType;
            createTableStatement += ', '
        }
        createTableStatement = createTableStatement.substr(0, createTableStatement.length - 2);

        createTableStatement += '); ';

        let skipHeader = false;
        let importStatement = 'IMPORT TABLE ';
        importStatement += tableName + ' ';
        importStatement += '(';
        for (const columnPair of columnInfoMap) {
            const columnInfo = columnPair.value;
            importStatement += columnInfo.electedHeaderName;
            importStatement += ' ';
            importStatement += columnInfo.electedType;
            importStatement += ', '
            if (columnInfo.skipHeader == 1) {
                skipHeader = true;
            }
        }
        importStatement = importStatement.substr(0, importStatement.length - 2);
        importStatement += ') ';
        importStatement += ' CSV DATA ('
        importStatement += '\'' + fileUrl + '\'';
        importStatement += ') ';
        importStatement += 'WITH delimiter = ';
        importStatement += '\'' + delimeter + '\'';
        if (skipHeader) {
            importStatement += ' , ';
            importStatement += 'skip = \'1\''
        }

        //importStatement += ' , ';
        //importStatement += 'strict_quotes = '
        //importStatement += strictQuoteValue;
        //importStatement += ' , ';
        //importStatement += 'experimental_save_rejected = ON ';

        importStatement += ' ;';
        return { importStatement, createTableStatement };
    }



    /**
     * 1. Ignore the first row as it might be the header
     * 2. For each following row: 
     *   a. split on delimeter
     *   b. Try to analyze each row in the splitted row and figure out the data type. String is the default. 
     * 3. account for variable cell numbers. some row might have 10 cells others might have 11 
     * 
     * 
     * @param sampleLines 
     */
    extractDataTypes(sampleLines: string[], delimeter: string): any {
        var columnTypeInfo = new HashMap();
        const dateValidator = new DateValidatior();
        const timeStampValidator = new TimeStampValidatior();
        const numberValidator = new NumberValidator();
        // First line is assumed to be the header. 
        const headerParts = CSV.parse(sampleLines[0], delimeter)[0];
        for (let i = 0; i < headerParts.length; i++) {
            columnTypeInfo.set(i + 1, { suggestedHeader: headerParts[i], dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 0 });
        }

        for (let i = 1; i < sampleLines.length; i++) {
            const dataParts = CSV.parse(sampleLines[i], delimeter)[0];
            for (let j = 0; j < dataParts.length; j++) {
                var columnInfo = columnTypeInfo.get(j + 1);
                if (!columnInfo) {
                    columnTypeInfo.set(j + 1, { suggestedHeader: 'Header_' + (j + 1), dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 0 });
                    columnInfo = columnTypeInfo.get(j + 1);
                }

                var cell = dataParts[j];
                columnInfo = this.calculteCellDataTypePercent(cell, columnInfo, dateValidator, timeStampValidator, numberValidator);

                columnTypeInfo.set(j + 1, columnInfo);
            }
        }


        var finalColumnTypeInfo = new HashMap();
        var nonStringColumnWithMatchingHeaderTypeCounter = 0;
        var nonStringColumnWithStringHeaderTypeCounter = 0;
        var nonStringColumnCounter = 0;

        for (const columnPair of columnTypeInfo) {
            let columnInfo = columnPair.value;
            columnInfo = this.electCellDataType(columnInfo, sampleLines.length);



            const headerCell = sampleLines[columnPair.key - 1];
            let headerCellInfo = this.calculteCellDataTypePercent(headerCell, { dateIndex: 0, timeStampIndex: 0, numberIndex: 0, stringIndex: 0 }, dateValidator, timeStampValidator, numberValidator);
            headerCellInfo = this.electCellDataType(headerCellInfo, 1);

            if (columnInfo.electedType !== DATA_TYPE_STRING) {
                nonStringColumnCounter++;
                if (headerCellInfo.electedType === columnInfo.electedType) {
                    nonStringColumnWithMatchingHeaderTypeCounter++;
                } else {
                    nonStringColumnWithStringHeaderTypeCounter++;
                }
            }
            columnInfo.calculatedHeaderType = headerCellInfo.electedType;
            finalColumnTypeInfo.set(columnPair.key, columnInfo);
        }


        for (const columnPair of columnTypeInfo) {
            let columnInfo = columnPair.value;
            if (nonStringColumnWithStringHeaderTypeCounter > nonStringColumnWithMatchingHeaderTypeCounter) {
                columnInfo.electedHeaderName = columnInfo.suggestedHeader;
                columnInfo.skipHeader = 1;
            } else {
                columnInfo.electedHeaderName = 'Header_' + columnPair.key;
            }


            columnInfo.electedHeaderName = this.sanitizeString(columnInfo.electedHeaderName);

            if (columnInfo.electedHeaderName.length > 63) {
                columnInfo.electedHeaderName = columnInfo.electedHeaderName.substr(0, 60);
            }

            finalColumnTypeInfo.set(columnPair.key, columnInfo);
        }

        return finalColumnTypeInfo;
    }


    electCellDataType(columnInfo: any, sampleLinesLength: number): any {
        const dateIndex = columnInfo.dateIndex;
        const datePercent = (dateIndex === 0) ? 0 : dateIndex * 100 / sampleLinesLength;

        const timeStampIndex = columnInfo.timeStampIndex;
        const timeStampPercent = (timeStampIndex === 0) ? 0 : timeStampIndex * 100 / sampleLinesLength;

        const numberIndex = columnInfo.numberIndex;
        const numberPercent = (numberIndex === 0) ? 0 : numberIndex * 100 / sampleLinesLength;

        const stringIndex = columnInfo.stringIndex;
        const stringPercent = (stringIndex === 0) ? 0 : stringIndex * 100 / sampleLinesLength;

        let electedType = '';

        if (numberPercent > datePercent && numberPercent > timeStampPercent && numberPercent > stringPercent) {
            electedType = DATA_TYPE_NUMERIC;
        } else if (timeStampPercent > datePercent && timeStampPercent > numberPercent && datePercent > stringPercent) {
            electedType = DATA_TYPE_TIMESTAMP;
        } else if (datePercent > timeStampPercent && datePercent > numberPercent && datePercent > stringPercent) {
            electedType = DATA_TYPE_DATE;
        } else {
            electedType = DATA_TYPE_STRING;
        }

        columnInfo.electedType = electedType;
        columnInfo.dateMatchPercent = datePercent;
        columnInfo.timeStampMatchPercent = timeStampPercent;
        columnInfo.numberMatchPercent = numberPercent;
        columnInfo.stringMatchPercent = stringPercent;

        return columnInfo;
    }
    calculteCellDataTypePercent(cell: any, columnInfo: any, dateValidator: DateValidatior, timeStampValidator: TimeStampValidatior, numberValidator: NumberValidator): any {

        if (!cell || cell === '' || cell.indexOf(PLUS_OPERATOR) > -1) {
            columnInfo.stringIndex = columnInfo.stringIndex++;
            return columnInfo;
        }

        const isValidDate = dateValidator.isValidDate(cell);
        const isValidTimestamp = timeStampValidator.isValidTime(cell);
        const isValidNumber = numberValidator.isValidNumber(cell);

        if (isValidDate) {
            columnInfo.dateIndex = columnInfo.dateIndex + 1;
        }

        if (isValidTimestamp && isValidNumber) {
            columnInfo.numberIndex = columnInfo.numberIndex + 1;
        } else if (isValidTimestamp && !isValidNumber) {
            columnInfo.timeStampIndex = columnInfo.timeStampIndex + 1;
        } else if (!isValidTimestamp && isValidNumber) {
            columnInfo.numberIndex = columnInfo.numberIndex + 1;
        }

        if (!isValidDate && !isValidTimestamp && !isValidNumber) {
            columnInfo.stringIndex = columnInfo.stringIndex + 1;
        }
        return columnInfo;

    }


    /**
     * 1. Loop over the array
     * 2. For each line, try to split on each of the following possible splitters: (tabs, semi-colons, pipes, carets, comma)
     * 3. 
     * @param sampleLines 
     */
    extractDelimeter(sampleLines: string[]): string {
        const commaArray = [];
        const tabArray = [];
        const semiColonArray = [];
        const pipeArray = [];
        const caretArray = [];

        for (const sampleLine of sampleLines) {
            const bestSeparator = CSV.detect(sampleLine);
            const lineParts = CSV.parse(sampleLine, bestSeparator);
            const linePartsLength = lineParts[0].length;
            if (bestSeparator == COMMA_DELIMITER) {
                commaArray.push(linePartsLength);
            } else {
                commaArray.push(0);
            }

            if (bestSeparator == TAB_DELIMITER) {
                tabArray.push(linePartsLength);
            } else {
                tabArray.push(0);
            }

            if (bestSeparator == SEMI_COLONS_DELIMITER) {
                semiColonArray.push(linePartsLength);
            } else {
                semiColonArray.push(0);
            }

            if (bestSeparator == PIPE_DELIMITER) {
                pipeArray.push(linePartsLength);
            } else {
                pipeArray.push(0);
            }

            if (bestSeparator == CARET_DELIMITER) {
                caretArray.push(linePartsLength);
            } else {
                caretArray.push(0);
            }

        }
        const possibleMatchCandidates = [];

        possibleMatchCandidates.push(this.calculateMatchSplitter(commaArray, COMMA_DELIMITER));
        possibleMatchCandidates.push(this.calculateMatchSplitter(tabArray, TAB_DELIMITER));
        possibleMatchCandidates.push(this.calculateMatchSplitter(semiColonArray, SEMI_COLONS_DELIMITER));
        possibleMatchCandidates.push(this.calculateMatchSplitter(pipeArray, PIPE_DELIMITER));
        possibleMatchCandidates.push(this.calculateMatchSplitter(caretArray, CARET_DELIMITER));

        let currentMatchCandidate = possibleMatchCandidates[0];
        for (const matchCandiadate of possibleMatchCandidates) {
            if (matchCandiadate.matchPercent !== 0) {
                if (matchCandiadate.matchPercent > currentMatchCandidate.matchPercent) {
                    currentMatchCandidate = matchCandiadate;
                } else if (matchCandiadate.matchPercent < currentMatchCandidate.matchPercent) {
                } else {
                }
            }
        }

        if (currentMatchCandidate.matchPercent < 50) {
            throw new Error('Electing delimeter failed. Match percentage is: ' + currentMatchCandidate.matchPercent + ' for: [' + currentMatchCandidate.delimeter + ']');
        }

        return currentMatchCandidate.delimeter;
    }

    calculateMatchSplitter(inputArray: number[], delimeter: string): any {
        var map = new HashMap();

        for (const val of inputArray) {
            if (val != 0) {
                let mapVal: number = map.get(delimeter);
                if (mapVal) {
                    mapVal++;
                    map.set(delimeter, mapVal);
                } else {
                    map.set(delimeter, 1);
                }
            }
        }

        if (map.size == 0) {

            return { matchPercent: 0, delimeter };
        }

        for (const pair of map) {
            const matchPercentage = pair.value * 100 / inputArray.length;
            return { matchPercent: matchPercentage, delimeter };
        }
    }

    extractStrictQuotes(sampleLines: string[], delimeter: string): any {
        const lineParts = CSV.parse(sampleLines[0], delimeter);
        const numberOfCells = lineParts[0].length;
        const totalCellNumber = (sampleLines.length - 1)  * numberOfCells;   //Approximate 
        let strictQuoteMatchCounter = 1;

        for (let i = 1; i < sampleLines.length; i++) {
            const dataParts = CSV.parse(sampleLines[i], delimeter)[0];
            for (let j = 0; j < dataParts.length; j++) {
                const cell = dataParts[j];
                if (cell && cell.startsWith("\"") && cell.endsWith("\"")) {
                    strictQuoteMatchCounter++;
                }
            }
        }
        const strictQuoteMatchPercentage = strictQuoteMatchCounter * 100 / totalCellNumber;
        const strictQuoteValue = (strictQuoteMatchPercentage > 90) ? 'ON' : 'OFF';
        return strictQuoteValue;
    }


    sanitizeString(input: string): string {
        input = stringSanitizer.sanitize.addUnderscore(input);
        input = input.replace(/-/g, '_');

        return input;
    }

}