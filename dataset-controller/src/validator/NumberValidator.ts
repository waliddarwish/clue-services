const isNumber = require('is-number');


export class NumberValidator {

    constructor() {
    }


    isValidNumber(input: string): boolean {
        return isNumber(input);
    }
}