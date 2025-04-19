import { Injectable, Inject, HttpService, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { Node } from '../../database-module/src/database.schemas';
import config = require('config/config.json');
import { LogService } from '../../log-module/src/log.service';

@Injectable()
export class OrchService {

 

  constructor(@Inject('nodeProvider') private readonly nodeModel: Model<Node>,
              @Inject((forwardRef(() => HttpService))) private readonly httpService: HttpService,
              private readonly logService: LogService) {

  }
 



}
