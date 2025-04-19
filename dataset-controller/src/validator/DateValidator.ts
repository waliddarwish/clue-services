const { DateTime } = require("luxon");


export class DateValidatior {

    constructor() {

    }

    // TODO: Date validator will only check for SQL format date for now. 
    isValidDate(input: string): boolean {
        let validDate: boolean = false;
        if (this.parseDateFromSQL(input)) {
            validDate = true;
        }
        return validDate;
    }

    private parseDateIso8601(input: string): any {
        let formatedDate = DateTime.fromISO(input);
        if (formatedDate.invalid) {
            return false;
        } else {
            return true;
        }
    }

    private parseDateRFC2822(input: string): any {
        let formatedDate = DateTime.fromRFC2822(input);
        if (formatedDate.invalid) {
            return false;
        } else {
            return true;
        }
    }

    private parseDateFromSQL(input: string): any {
        let formatedDate = DateTime.fromSQL(input);
        if (formatedDate.invalid) {
            return false;
        } else {
            return true;
        }
    }
}