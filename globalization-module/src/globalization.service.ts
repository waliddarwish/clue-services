import { Injectable, HttpService, Inject } from '@nestjs/common';

@Injectable()
export class GlobalizationService {
    constructor(private readonly httpService: HttpService) {

    }

    async get(language: string, key: string): Promise<any> {

        return this.httpService.get('http://' + 'globalizer' + ':' + '8300'
            + '/globalization/entry/' + language + '/' + key).toPromise().then((result: any) => {
                return result.data.data;
            }).catch((error) => {
                return key;
            });
    }
}
