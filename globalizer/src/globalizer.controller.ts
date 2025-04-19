import { Get, Controller, Param } from '@nestjs/common';
import { GlobalizationEntryObject } from '../../globalization-module/src/globalization.entry';
import { GlobalizerService } from './globalizer.service';
import { GlobalizationEntry } from '../../globalization-module/src/globalization.schema';

@Controller('globalization')
export class GlobalizerController {

    constructor(private readonly globalizerService: GlobalizerService) {}

    @Get('entry/:lang/:key')
    async get(@Param() params): Promise<any> {
        return this.globalizerService.get(params.lang, params.key).then((globalizationEntry: GlobalizationEntry): any => {
            return { status : 0 , message: 'Success' , data: globalizationEntry.message};
        }).catch ((err) => {
            return { status : 0 , message : 'Success' , data: params.key};
        });
    }
}