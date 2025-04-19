import { SubscriptionPlanService } from "./subscription-plan.service";

describe('Test SubscriptionPlanService ', () => {
let subscriptionPlanProvider;
let subscriptionPlanService;
let newPlan = {};
    beforeEach(async () => {
        jest.clearAllMocks();
        subscriptionPlanProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return newPlan }),
                save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
            }});
        subscriptionPlanProvider.findOneAndUpdate = jest.fn().mockReturnValue(subscriptionPlanProvider);
        subscriptionPlanProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'subscriptionPlanProviderExec' }));
        subscriptionPlanProvider.updateOne = jest.fn().mockReturnValue(subscriptionPlanProvider);
        subscriptionPlanProvider.deleteOne = jest.fn().mockReturnValue(subscriptionPlanProvider);
        subscriptionPlanProvider.delete = jest.fn().mockReturnValue(subscriptionPlanProvider);
        subscriptionPlanProvider.find = jest.fn().mockReturnValue(subscriptionPlanProvider);
        subscriptionPlanProvider.findOne = jest.fn().mockReturnValue(subscriptionPlanProvider);
        subscriptionPlanService = new SubscriptionPlanService(subscriptionPlanProvider);

    });

    it('Test add', async () => {
        let result = await subscriptionPlanService.add({});
        expect(result).toEqual({ name: 'saved' });
    });

    it('test update', async() => {
        let theId = 'theId';
        let result = await subscriptionPlanService.update(theId, {});
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.updateOne).toBeCalledWith({ id: theId }, expect.anything());
    });

    it('test delete', async() => {
        let theId = 'theId';
        let result = await subscriptionPlanService.delete(theId);
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.deleteOne).toBeCalledWith({ id: theId });
    });

    it('test getAll', async() => {
        let theId = 'theId';
        let result = await subscriptionPlanService.getAll();
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.find).toBeCalledWith();
    });
    it('test getAllActive', async() => {
        let theId = 'theId';
        let result = await subscriptionPlanService.getAllActive();
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.find).toBeCalledWith({status: 'Active'});
    });

    it('test get', async() => {
        let theId = 'theId';
        let result = await subscriptionPlanService.get(theId);
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.findOne).toBeCalledWith({ id: theId });
    });

    it('test validateExistingStripeCodePlan', async() => {
        let thePlan = {planStripeCode: '191919'};
        let result = await subscriptionPlanService.validateExistingStripeCodePlan(thePlan);
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.findOne).toBeCalledWith({planStripeCode: thePlan.planStripeCode});
    });


    it('test validateEditedStripeCodePlan', async() => {
        let thePlan = {planStripeCode: '191919'};
        let planId = 'planId';
        let result = await subscriptionPlanService.validateEditedStripeCodePlan(thePlan, planId);
        expect(result).toEqual({ name: 'subscriptionPlanProviderExec' });
        expect(subscriptionPlanProvider.findOne).toBeCalledWith({planStripeCode: thePlan.planStripeCode, id: {$ne : planId}});
    });

});