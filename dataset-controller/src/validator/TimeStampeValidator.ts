const { DateTime } = require("luxon");


export class TimeStampValidatior {

    constructor() {

    }

    // TODO: Time validator will only check for SQL format date for now. 
    isValidTime(input: string): boolean {
        let validDate: boolean = false;
        if (this.parseTimeMillis(input)) {
            validDate = true;
        }
        return validDate;
    }

    private parseTimeMillis(input: string): any {
        let formatedDate = DateTime.fromMillis(+input);
        if (formatedDate.invalid) {
            return false;
        } else {
            return true;
        }
    }


}