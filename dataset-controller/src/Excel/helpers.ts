const stringSanitizer = require("string-sanitizer");

export class ExcelHelper {

    incrementString(value, emptyColumns?) {
        let carry = 1;
        let res = '';
    
        for (let i = value.length - 1; i >= 0; i--) {
          let char = value.toUpperCase().charCodeAt(i);
    
          char += carry;
    
          if (char > 90) {
            char = 65;
            carry = 1;
          } else {
            carry = 0;
          }
    
          res = String.fromCharCode(char) + res;
    
          if (!carry) {
            res = value.substring(0, i) + res;
            break;
          }
        }
    
        if (carry) {
          res = 'A' + res;
        }

        if (emptyColumns && emptyColumns[res]) {
            return this.incrementString(res, emptyColumns);
        }
    
        return res;
      }
    
      sanitizeString(input: string): string {
        input = stringSanitizer.sanitize.addUnderscore(input);
        input = input.replace(/-/g, '_');
    
        return input;
      }

      sanitizeStringKeepUnderscore(input: string) : string {
        var str2 = input.replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
        return str2.replace(/ /g, "_");
      }



      prepareCellForCSV(cellValue: string) : string {
        let needDoubleQuote = false;
        if(typeof cellValue === 'string' ){
          if (cellValue && cellValue.indexOf(',') > -1) {
            needDoubleQuote = true;
          }

          if (cellValue && cellValue.indexOf('\'') > -1) {
            cellValue = cellValue.replace(/\'/g, '\\\'');
            needDoubleQuote = true;
          }

          if (cellValue && cellValue.indexOf('"') > -1) {
            cellValue = cellValue.replace(/"/g, '""');
            needDoubleQuote = true;
          }
        }
        if (needDoubleQuote) {
          cellValue = '"' + cellValue + '"';
        }
        return cellValue;
      }
}