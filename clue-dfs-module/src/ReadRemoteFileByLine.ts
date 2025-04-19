const fs = require("fs");
const http = require("http");
const https = require("https");
const readline = require('readline');
const Emitter = require('events').EventEmitter;



export class ReadRemoteFileByLine extends Emitter {

    constructor(theUrl: string, theSaveFilePath?: string) {
        super();
        this.url = theUrl;
        this.saveFilePath = theSaveFilePath || __dirname + "/rrbl.txt";
        //this.file = null;
        this.index = 0;
    }
    closeStream() {
        this.file.close();
    }
    async readByLine(): Promise<any> {

        this.file = fs.createWriteStream(this.saveFilePath);
        this.file.on('pipe', (src) => {
            const rl = readline.createInterface({
                input: src
            });

            rl.on('line', (line) => {
                this.emit("line", line);
            });

            rl.on('close', () => {
                this.emit("complete", () => {
                });
            });
            rl.on('reject', () => {
                this.emit("error", () => {
                });
            });
        });

        if (this.url.indexOf('https') > -1) {
            https.get(this.url, response => {
                response.pipe(this.file);
            });
        } else {
            http.get(this.url, response => {
                response.pipe(this.file);
            });
        }
    }
}