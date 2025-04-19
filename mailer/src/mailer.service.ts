import { Injectable, Logger } from '@nestjs/common';
import Email = require('email-templates');


@Injectable()
export class AppMailerService {
    private logger = new Logger('AppMailerService');
    private transporter: any;
    private sourceEmail: string;

    public setSourceEmail(email: string) {
        this.sourceEmail = email;
    }

    public setTransporter(aTransporter: any) {
        this.transporter = aTransporter;
    }

    async sendMail(targetEmail: string, aTemplate: string, params: any): Promise<any> {
        const email = new Email({
            transport: this.transporter,
            send: true,
            preview: false,
          });
        return email.send({
            template: aTemplate,
            message: {
              from: 'Clue Analytics <' + this.sourceEmail + '>',
              to: targetEmail,
            },
            locals: params,
          }).catch((error) => {
            this.logger.error(error);
            return error;
          });
    }
}
