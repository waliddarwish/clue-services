import { Injectable } from '@nestjs/common';
import { GlobalizationEntry, GlobalizationSchema } from '../../globalization-module/src/globalization.schema';
import { Connection , Model } from 'mongoose';
import { GlobalizationEntryObject } from '../../globalization-module/src/globalization.entry';


@Injectable()
export class GlobalizerService {

    private globalizationModel: Model<GlobalizationEntry>;
    
    initService(connection: Connection) {
      this.globalizationModel = connection.model('GlobalizationEntry', GlobalizationSchema , 'global');
    }

    async get(aLang: string, aKey: string): Promise<GlobalizationEntryObject> {
      return this.globalizationModel.findOne({ language: aLang , key: aKey  }).exec();
    }

}