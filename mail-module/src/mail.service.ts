import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class AppMailService {

  constructor(private readonly httpService: HttpService) {
  }


  async sendMail(theTemplate: string, receiver: string, theContext: any): Promise<any> {
    return this.httpService.post('http://' + 'mailer' + ':' + '8320'
      + '/mail/send', { targetEmail: receiver, template: theTemplate, context: theContext }).toPromise().then((result) => {
        if (result && result.data && result.data.status === 0) {
          return result.data;
        } else {
          return { status: 1013, message: 'Internal Error - unable to send email' };
        }
      }).catch((error) => {
        return { status: 1013, message: 'Internal Error - unable to send email' };
      });
  }
}
