
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { GlobalizationService } from './globalization.service';

const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    get: jest.fn()
};



describe("Test globalization module", () => {
    let httpService;
    let globalizationService;
    let theLanguage = 'en';
    let theKey = 'end-game';

    beforeEach( async () => {
        const module = await Test.createTestingModule({
            providers: [
                GlobalizationService,
                { provide: HttpService, useFactory: () => { return mockHttpService } } ,
            ]
       }).compile();
       httpService = await module.get<HttpService>(HttpService);
       globalizationService = await module.get<GlobalizationService>(GlobalizationService);
    });

    it('test getting key successfully', () => {
        let result = {
            data: {
                status: 0,
                message: "successful",
                data: "iron man"
            }
        };
        

        httpService.get.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue(result);
        expect(globalizationService.get(theLanguage, theKey)).resolves.toEqual(result.data.data);
        expect(httpService.get).toBeCalledWith('http://' + 'globalizer' + ':' + '8300'
        + '/globalization/entry/' + theLanguage + '/' + theKey);
    });


    it('toPromise will throw an exception', () => {
       
        httpService.get.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue(new Error('failed'));
        expect(globalizationService.get(theLanguage, theKey)).resolves.toEqual(theKey);
        expect(httpService.get).toBeCalledWith('http://' + 'globalizer' + ':' + '8300'
        + '/globalization/entry/' + theLanguage + '/' + theKey);
    });
});