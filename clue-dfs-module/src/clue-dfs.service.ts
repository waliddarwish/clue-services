import { Injectable, HttpService } from '@nestjs/common';
import weedClient = require("node-seaweedfs");
let config;
try { 
    config = require('config/config.json');
} catch (e) {
    config = {
        clueDFS : {
            host : "somehost",
        }
    }
}
import { ReadRemoteFileByLine } from './ReadRemoteFileByLine';
import { json } from 'body-parser';

@Injectable()
export class ClueDFSService {
    private seaweedClient;
    constructor(private readonly httpService: HttpService) {
        this.initWeedConfig(config);
    }

    public initWeedConfig(weedConfig) {
        this.seaweedClient = new weedClient(weedConfig);
    }

    async  writeFile(fileNames: string[], options: any): Promise<any> {
        return this.seaweedClient.write(fileNames, options).then((fileInfo) => {
            return fileInfo;
        });
    }

    async  writeBuffer(buffer: Buffer, options: any): Promise<any> {
        return this.seaweedClient.write(buffer, options).then((fileInfo) => {
            return fileInfo;
        });
    } 

    async readFile(fileId: string): Promise<any> {
        return this.seaweedClient.read(fileId); // returns a` buffer stream`
    }

    async readFileStream(fileId: string, stream): Promise<any> {
        return this.seaweedClient.read(fileId, stream); // returns a` buffer stream`
    }

    // Not covered by unit test (too)
    async readFromFileUrl(fileUrl: string, sampleAvaliable, sampleError) {
        let read = new ReadRemoteFileByLine(fileUrl);
        let lines = [];
        const samples = [];
        let finished = false;
        read.on("line", (line) => {
            lines.push(line);

        });

        read.readByLine();

        read.on("complete", () => {
            let samplingStart = new Date().getMilliseconds();
            if (lines.length <= 1000) {

                sampleAvaliable(lines);
                return;
            }

            const stepSize = Math.round(lines.length / 1000);
            let stepTracker = 0;
            let sampleArrayIndex = 0;

            samples[sampleArrayIndex++] = lines[0]; // Always add the header

            for (let i = 1; i < lines.length; i++) {
                if (stepTracker < stepSize) {
                    stepTracker++;
                } else {
                    stepTracker = 0;
                    samples[sampleArrayIndex++] = lines[i];
                }
            }
            let endSampling = new Date().getMilliseconds();
            finished = true;
            sampleAvaliable(samples);

        });
        read.on('error', () => {
            sampleError("Error");
        })


    }


    async removeFile(fileId: string): Promise<any> {
        return this.seaweedClient.remove(fileId);
    }

    async vaccum(garbageThreshold): Promise<any> {
        return this.seaweedClient.vacuum({ garbageThreshold });
    }

    async assignFid(): Promise<any> {
        return this.httpService.post('http://' + config.clueDFS.host + ':' + config.clueDFS.port
            + '/dir/assign').toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error: ' + JSON.stringify(error)};
            });
    }

    async lookupVolumeUrl(volumeId: string): Promise<any> {
        return this.httpService.post('http://' + config.clueDFS.host + ':' + config.clueDFS.port
            + '/dir/lookup?volumeId=' + volumeId).toPromise().then((result: any) => {
                return result.data;
            });
    }

    async renderFileUrl(volumeId: string, fileId: string, extension: string, usePuplicUrl: boolean, skipExtension?: boolean): Promise<any> {
        return this.lookupVolumeUrl(volumeId).then(
            (theVolumeInfo) => {
                let randomVolumeUrl = "" ;    
                if (usePuplicUrl) {
                    randomVolumeUrl = theVolumeInfo.locations[Math.floor(Math.random() * theVolumeInfo.locations.length)].publicUrl;
                } else {
                    randomVolumeUrl = theVolumeInfo.locations[Math.floor(Math.random() * theVolumeInfo.locations.length)].url;
                }
                //const randomVolumeUrl: [] = theVolumeInfo.locations[Math.floor(Math.random() * theVolumeInfo.locations.length)].publicUrl;
                let fileUrl = 'http://' + randomVolumeUrl + '/' + volumeId + ',' + fileId;
                if (extension && !skipExtension) {
                    fileUrl += '.' + extension;
                }
                return fileUrl;
            }
        );
    }
}
