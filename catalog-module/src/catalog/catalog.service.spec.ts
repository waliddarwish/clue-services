import { CatalogService } from "./catalog.service";
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { AppMailService } from '../../../mail-module/src/mail.service'; 
import { Test } from '@nestjs/testing';
import passwordGenerator = require('generate-password');
import { exec } from "child_process";


describe("Test Catalog Service", () => {
    let tenantObject = {
        id: 'test',
        paymentDetails: {
            paymentMethod: {
                id: 1234,
                name: 'master card'
            },
            stripeCustomerDetails: { id: '944848'},
            stripeSubscription: {
                id: '1234'
            },
            subscribeTenant: true
        },
        subscriptionPlan: 'test plan',
    };
    let mailService;
    let mailServiceMocked = {
        sendMail: jest.fn()
    };
    let authService;
    let authServiceMocked = {
        hashEncryptedPassword: jest.fn(),
        hashPlainPassword: jest.fn(),
    };

    let tenantModel = {
        exec: jest.fn(),
        deleteOne : jest.fn().mockImplementation(() => tenantModel),
        findOne : jest.fn().mockImplementation(() => tenantModel),
        find : jest.fn().mockImplementation(() => tenantModel),
        updateOne: jest.fn().mockImplementation(() => tenantModel),
    };

    let userModel = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => userModel),
        deleteOne: jest.fn().mockImplementation(() => userModel),
        findOne: jest.fn().mockImplementation(() => userModel),
        find: jest.fn().mockImplementation(() => userModel),
        updateOne: jest.fn().mockImplementation(() => userModel),
    };

    let invitationModel = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => invitationModel),
    };

    let taskModel = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => taskModel),
    };

    let metadataTrackerProvider = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => metadataTrackerProvider),
    };

    let dsConnectionModel = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => dsConnectionModel),
    };
    let clueModel = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => clueModel),
    };
    let clueModelObject = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => clueModelObject),
    };
    let datasetProvider = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => datasetProvider),
    };
    let vizBookProvider = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => vizBookProvider),
    };
    let vizPageProvider = {
        exec: jest.fn(),
        deleteMany: jest.fn().mockImplementation(() => vizPageProvider),
    };
    let stripeClient = {
        customers : {
            create: jest.fn(),
            update: jest.fn()
        }, 
        subscriptions: {
            create: jest.fn(),
            update: jest.fn(),
            retrieve: jest.fn(),
            del: jest.fn()
        },
        plans: {
            list: jest.fn()
        },
        paymentMethods: {
            detach: jest.fn(),
            attach: jest.fn()
        }
    };

    let catalogService: CatalogService;

    beforeEach(async () => {

        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                { provide: AppMailService, useFactory: () => { return mailServiceMocked } },
                { provide: AuthenticationService, useFactory: () => { return authServiceMocked } },
            ]
        }).compile();
        mailService = await module.get<AppMailService>(AppMailService);
        authService = await module.get<AuthenticationService>(AuthenticationService);


        catalogService = new CatalogService(
            tenantModel,
            userModel,
            invitationModel,
            taskModel,
            metadataTrackerProvider,
            authService,
            mailService,
            dsConnectionModel,
            clueModel,
            clueModelObject,
            datasetProvider,
            vizBookProvider,
            vizPageProvider,
            stripeClient
        );

        jest.genMockFromModule('generate-password');
        jest.mock('generate-password');

    });

    it("deleteTenant success senario 1" , async () =>  {
        tenantModel.exec.mockResolvedValue(Promise.resolve({}));
        userModel.exec.mockResolvedValue(Promise.resolve({}));
        invitationModel.exec.mockResolvedValue(Promise.resolve({}));
        taskModel.exec.mockResolvedValue(Promise.resolve({}));
        dsConnectionModel.exec.mockResolvedValue(Promise.resolve({}));
        metadataTrackerProvider.exec.mockResolvedValue(Promise.resolve({}));
        clueModelObject.exec.mockResolvedValue(Promise.resolve({}));
        clueModel.exec.mockResolvedValue(Promise.resolve({}));
        datasetProvider.exec.mockResolvedValue(Promise.resolve({}));
        vizBookProvider.exec.mockResolvedValue(Promise.resolve({}));
        vizPageProvider.exec.mockResolvedValue(Promise.resolve({}));
        expect(await catalogService.deleteTenant("Some tenant id")).resolves;
        expect(tenantModel.exec).toHaveBeenCalledTimes(1);
        expect(userModel.exec).toHaveBeenCalledTimes(1);
        expect(invitationModel.exec).toHaveBeenCalledTimes(1);
        expect(taskModel.exec).toHaveBeenCalledTimes(1);
        expect(dsConnectionModel.exec).toHaveBeenCalledTimes(1);
        expect(metadataTrackerProvider.exec).toHaveBeenCalledTimes(1);
        expect(clueModelObject.exec).toHaveBeenCalledTimes(1);
        expect(clueModel.exec).toHaveBeenCalledTimes(1);
        expect(datasetProvider.exec).toHaveBeenCalledTimes(1);
        expect(vizBookProvider.exec).toHaveBeenCalledTimes(1);
        expect(vizPageProvider.exec).toHaveBeenCalledTimes(1);

        expect(tenantModel.deleteOne).toHaveBeenCalledWith({ id: "Some tenant id"});
        expect(userModel.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(invitationModel.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(taskModel.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(dsConnectionModel.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(metadataTrackerProvider.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(clueModelObject.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(clueModel.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(datasetProvider.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(vizBookProvider.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});
        expect(vizPageProvider.deleteMany).toHaveBeenCalledWith({ tenantId: "Some tenant id"});

    });

    it("deleteTenant failure senario 1" , async () =>  {
        tenantModel.exec.mockRejectedValue({});
        userModel.exec.mockResolvedValue(Promise.resolve({}));
        invitationModel.exec.mockResolvedValue(Promise.resolve({}));
        taskModel.exec.mockResolvedValue(Promise.resolve({}));
        dsConnectionModel.exec.mockResolvedValue(Promise.resolve({}));
        metadataTrackerProvider.exec.mockResolvedValue(Promise.resolve({}));
        clueModelObject.exec.mockResolvedValue(Promise.resolve({}));
        clueModel.exec.mockResolvedValue(Promise.resolve({}));
        datasetProvider.exec.mockResolvedValue(Promise.resolve({}));
        vizBookProvider.exec.mockResolvedValue(Promise.resolve({}));
        vizPageProvider.exec.mockResolvedValue(Promise.resolve({}));
        expect(catalogService.deleteTenant("Some tenant id")).rejects.toEqual({});
    });

    describe('It test createTenantSubscription', () => {


        let stripCreateResponse = {
            id: '9585'
        };
        let tenantObject;
        tenantObject = {
            id: 'test',
            paymentDetails: {
                paymentMethod: {
                    id: 1234,
                    name: 'master card'
                },
                stripeCustomerDetails: {},
                stripeSubscription: {
                    id: '1234'
                },
                subscribeTenant: true
            },
            subscriptionPlan: 'test plan',
        };
        let userObject;
        userObject = {
            username: 'abdo'
        };
        it(" createTenantSubscription success scenario 1" , async () =>  {
            stripeClient.customers.create.mockReturnValue(Promise.resolve(stripCreateResponse));
            stripeClient.subscriptions.create.mockReturnValue(Promise.resolve({name: 'sub creation', id: '12367'}));
            let result = await catalogService.createTenantSubscription(tenantObject, userObject);
            expect(result).toEqual(      {
                "id": "test",
                paymentDetails: {
                  paymentMethod: { "id": 1234, name: 'master card' },
                  stripeCustomerDetails: { "id": "9585",},
                  stripeSubscription: { name: 'sub creation', id: "12367"},
                  subscribeTenant: true
                },
                subscriptionPlan: 'test plan',
              });
            expect(stripeClient.customers.create).toBeCalledTimes(1);
            expect(stripeClient.subscriptions.create).toBeCalledTimes(1);
            expect(stripeClient.customers.create).toBeCalledWith({"email": "abdo", "invoice_settings": {"default_payment_method": 1234}, "name": "master card", "payment_method": 1234});
            expect(stripeClient.subscriptions.create).toBeCalledWith({"customer": "9585", "items": [{"plan": "test plan", "quantity": 1}]});
        });

        it(" createTenantSubscription success scenario 2" , async () =>  {
            tenantObject.paymentDetails.subscribeTenant = false;
            let result = await catalogService.createTenantSubscription(tenantObject, userObject);
            expect(result).toEqual(tenantObject);
        });
    });

    it('test getSubscriptionPlan', async () => {
        stripeClient.plans.list.mockResolvedValue(Promise.resolve({name: 'list'}));
        let result = await catalogService.getSubscriptionPlan();
        expect(result).toEqual({name: 'list'});
        expect(stripeClient.plans.list).toBeCalledTimes(1);
        expect(stripeClient.plans.list).toBeCalledWith();
    });

    it('test updateStripeSubQuantity scenario 1', async () => {
        let getTenantSubscriptionPlanIdOriginal = CatalogService.prototype.getTenantSubscriptionPlanId;
        let getTenantSubscriptionPlanIdMocked = CatalogService.prototype.getTenantSubscriptionPlanId = jest.fn().mockReturnValue(Promise.reject('Error'));
        
        expect(catalogService.updateStripeSubQuantity('tenant id', 5)).rejects.toEqual('Error');
        expect(getTenantSubscriptionPlanIdMocked).toBeCalledTimes(1);
        expect(getTenantSubscriptionPlanIdMocked).toBeCalledWith('tenant id');
        CatalogService.prototype.getTenantSubscriptionPlanId = getTenantSubscriptionPlanIdOriginal;
    });



    it('test updateStripeSubQuantity scenario 2', async () => {
        let tenantObject = {
            paymentDetails: {
                paymentMethod: {
                    id: 1234,
                    name: 'master card'
                },
                stripeCustomerDetails: {},
                stripeSubscription: {
                    id: '11294746'
                },
                subscribeTenant: true
            },
            subscriptionPlan: 'test plan',
        };
        let getTenantSubscriptionPlanIdOriginal = CatalogService.prototype.getTenantSubscriptionPlanId;
        let getTenantSubscriptionPlanIdMocked = CatalogService.prototype.getTenantSubscriptionPlanId = jest.fn().mockReturnValue(Promise.resolve(tenantObject));
        stripeClient.subscriptions.retrieve.mockReturnValue(Promise.resolve({quantity: 4, items: {data: [{id: 1348484}]}}));
        stripeClient.subscriptions.update.mockReturnValue(Promise.resolve({}));

        let result = await catalogService.updateStripeSubQuantity('tenant id', 5);
        expect(result).toEqual({});

        expect(getTenantSubscriptionPlanIdMocked).toBeCalledTimes(1);
        expect(getTenantSubscriptionPlanIdMocked).toBeCalledWith('tenant id');

        expect(stripeClient.subscriptions.retrieve).toBeCalledTimes(1);
        expect(stripeClient.subscriptions.retrieve).toBeCalledWith(tenantObject.paymentDetails.stripeSubscription.id);

        expect(stripeClient.subscriptions.update).toBeCalledTimes(1);
        expect(stripeClient.subscriptions.update).toBeCalledWith("11294746", {"items": [{"id": 1348484, "quantity": 9}]});
  



        CatalogService.prototype.getTenantSubscriptionPlanId = getTenantSubscriptionPlanIdOriginal;
    });


    it('test getTenantSubscriptionPlanId scenario 1', async () => {
        tenantModel.exec.mockReturnValue(Promise.resolve({name: "found"}));
        let result = await catalogService.getTenantSubscriptionPlanId('tenant id');
        expect(result).toEqual({name: "found"});
        expect(tenantModel.findOne).toBeCalledTimes(1);
        expect(tenantModel.findOne).toBeCalledWith({ id: 'tenant id' });

        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });

    it('test getTenantSubscriptionPlanId scenario 2', async () => {
        tenantModel.exec.mockReturnValue(Promise.reject({name: "found"}));
        expect(catalogService.getTenantSubscriptionPlanId('tenant id')).rejects.toEqual({name: "found"});
    });


    it('test deleteTenantUser scenario 1', async () => {
        let updateStripeSubQuantityOriginal = CatalogService.prototype.updateStripeSubQuantity;
        let updateStripeSubQuantityMocked = CatalogService.prototype.updateStripeSubQuantity = jest.fn();
        updateStripeSubQuantityMocked.mockReturnValue(Promise.resolve({name: 'updateStripe'}));
        let getUserOriginal = CatalogService.prototype.getUser;
        let getUserMocked = CatalogService.prototype.getUser = jest.fn().mockResolvedValue({tenantId: 1});

        let user = {username: 'fattah'};
        userModel.exec.mockReturnValueOnce(Promise.resolve(user));
        invitationModel.exec.mockReturnValueOnce(Promise.resolve({}));
        userModel.exec.mockReturnValueOnce(Promise.resolve(true));
        let result = await catalogService.deleteTenantUser('userId');
        expect(result).toEqual({name: 'updateStripe'});

        expect(userModel.findOne).toBeCalledTimes(1);
        expect(userModel.findOne).toBeCalledWith({ id: 'userId' });
        expect(userModel.exec).toBeCalledTimes(2);
        expect(userModel.exec).toBeCalledWith();
        expect(userModel.deleteOne).toBeCalledTimes(1);
        expect(userModel.deleteOne).toBeCalledWith({ "id": "userId"});
        expect(invitationModel.deleteMany).toBeCalledTimes(1);
        expect(invitationModel.deleteMany).toBeCalledWith({ email: user.username});
        expect(getUserMocked).toBeCalledTimes(1);
        expect(getUserMocked).toBeCalledWith('userId');
        expect(updateStripeSubQuantityMocked).toBeCalledTimes(1);
        expect(updateStripeSubQuantityMocked).toBeCalledWith(1, -1);

        CatalogService.prototype.updateStripeSubQuantity = updateStripeSubQuantityOriginal;
        CatalogService.prototype.getUser = getUserOriginal;
    });

    it('test deleteTenantUser scenario 2', async () => {
    
        let user = {username: 'fattah'};
        userModel.exec.mockReturnValueOnce(Promise.resolve(user));
        invitationModel.exec.mockReturnValueOnce(Promise.resolve({}));
        userModel.exec.mockReturnValueOnce(Promise.resolve(false));
        let result = await catalogService.deleteTenantUser('userId');
        expect(result).toEqual(false);

        expect(userModel.findOne).toBeCalledTimes(1);
        expect(userModel.findOne).toBeCalledWith({ id: 'userId' });
        expect(userModel.exec).toBeCalledTimes(2);
        expect(userModel.exec).toBeCalledWith();
        expect(userModel.deleteOne).toBeCalledTimes(1);
        expect(userModel.deleteOne).toBeCalledWith({ "id": "userId"});
        expect(invitationModel.deleteMany).toBeCalledTimes(1);
        expect(invitationModel.deleteMany).toBeCalledWith({ email: user.username});

    });

    it('test findAllTenants', async () => {
        tenantModel.exec.mockReturnValue(Promise.resolve({name: "found"}));
        let result = await catalogService.findAllTenants();
        expect(result).toEqual({name: "found"});
        expect(tenantModel.find).toBeCalledTimes(1);
        expect(tenantModel.find).toBeCalledWith();

        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });

    it('test findUsersByTenant', async () => {
        userModel.exec.mockReturnValue(Promise.resolve({name: "found"}));
        let result = await catalogService.findUsersByTenant('tenant id');
        expect(result).toEqual({name: "found"});
        expect(userModel.find).toBeCalledTimes(1);
        expect(userModel.find).toBeCalledWith({ tenantId: 'tenant id' });

        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
    });

    it('test isUserExists scenario 1', async () => {
        userModel.exec.mockReturnValue(Promise.resolve(['hello']));
        let result = await catalogService.isUserExists('user name');
        expect(result).toEqual(true);
        expect(userModel.find).toBeCalledTimes(1);
        expect(userModel.find).toBeCalledWith({ username: 'user name' });

        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
    });

    it('test isUserExists scenario 2', async () => {
        userModel.exec.mockReturnValue(Promise.resolve([]));
        let result = await catalogService.isUserExists('user name');
        expect(result).toEqual(false);
        expect(userModel.find).toBeCalledTimes(1);
        expect(userModel.find).toBeCalledWith({ username: 'user name' });

        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
    });

    it('test updateUser', async () => {
        let userObject;
        userObject = {};
        userModel.exec.mockReturnValue(Promise.resolve({name: 'updated'}));
        let result = await catalogService.updateUser('userId', userObject);
        expect(result).toEqual({name: 'updated'});
        expect(userModel.updateOne).toBeCalledTimes(1);
        expect(userModel.updateOne).toBeCalledWith({"id": "userId"}, {});

        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
    });

    it('test getUser', async () => {

        userModel.exec.mockReturnValue(Promise.resolve({name: 'getUser'}));
        let result = await catalogService.getUser('userId');
        expect(result).toEqual({name: 'getUser'});
        expect(userModel.findOne).toBeCalledTimes(1);
        expect(userModel.findOne).toBeCalledWith({ id: 'userId' });

        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
    });


    it('test changeUserStatus scenario 1', async() => {
        userModel.exec.mockReturnValue(Promise.resolve({status: 0}));
        let getUserOriginal = CatalogService.prototype.getUser;
        let getUserMocked = CatalogService.prototype.getUser = jest.fn().mockResolvedValue({tenantId: 1, status: 'Active'});
        let updateStripeSubQuantityOriginal = CatalogService.prototype.updateStripeSubQuantity;
        let updateStripeSubQuantityMocked = CatalogService.prototype.updateStripeSubQuantity = jest.fn();
        updateStripeSubQuantityMocked.mockReturnValue(Promise.resolve({name: 'updateStripe'}));

        let status = 'Active';
        let result = await catalogService.changeUserStatus('userId', status);
        expect(result).toEqual({name: 'updateStripe'});
        expect(userModel.updateOne).toBeCalledTimes(1);
        expect(userModel.updateOne).toBeCalledWith({ id: 'userId' }, { status });
        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
        expect(getUserMocked).toBeCalledTimes(1);
        expect(getUserMocked).toBeCalledWith('userId');
        expect(updateStripeSubQuantityMocked).toBeCalledTimes(1);
        expect(updateStripeSubQuantityMocked).toBeCalledWith(1, 1);

        CatalogService.prototype.getUser = getUserOriginal; 
        CatalogService.prototype.updateStripeSubQuantity =   updateStripeSubQuantityOriginal;
    });

    it('test changeUserStatus scenario 2', async() => {
        userModel.exec.mockReturnValue(Promise.resolve({status: 0}));
        let getUserOriginal = CatalogService.prototype.getUser;
        let getUserMocked = CatalogService.prototype.getUser = jest.fn().mockResolvedValue({tenantId: 1, status: 'Disabled'});
        let updateStripeSubQuantityOriginal = CatalogService.prototype.updateStripeSubQuantity;
        let updateStripeSubQuantityMocked = CatalogService.prototype.updateStripeSubQuantity = jest.fn();
        updateStripeSubQuantityMocked.mockReturnValue(Promise.resolve({name: 'updateStripe'}));

        let status = 'Disabled';
        let result = await catalogService.changeUserStatus('userId', status);
        expect(result).toEqual({name: 'updateStripe'});
        expect(userModel.updateOne).toBeCalledTimes(1);
        expect(userModel.updateOne).toBeCalledWith({ id: 'userId' }, { status });
        expect(userModel.exec).toBeCalledTimes(1);
        expect(userModel.exec).toBeCalledWith();
        expect(getUserMocked).toBeCalledTimes(1);
        expect(getUserMocked).toBeCalledWith('userId');
        expect(updateStripeSubQuantityMocked).toBeCalledTimes(1);
        expect(updateStripeSubQuantityMocked).toBeCalledWith(1, -1);

        CatalogService.prototype.getUser = getUserOriginal; 
        CatalogService.prototype.updateStripeSubQuantity =   updateStripeSubQuantityOriginal;
    });

    it('test changeTenantStatus', async () => {
        let tenantId = 'tenantId';
        let status = 'active';
        tenantModel.exec.mockReturnValue(Promise.resolve({}));

        let result = await catalogService.changeTenantStatus(tenantId, status);
        expect(result).toEqual({});
        expect(tenantModel.updateOne).toBeCalledTimes(1);
        expect(tenantModel.updateOne).toBeCalledWith({ id: tenantId }, { status });

        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });

    it('test updateTenant', async () => {
        let tenantId = 'tenantId';
        let tenantObject;
        tenantObject = {};
        tenantModel.exec.mockReturnValue(Promise.resolve({}));

        let result = await catalogService.updateTenant(tenantId, tenantObject);
        expect(result).toEqual({});
        expect(tenantModel.updateOne).toBeCalledTimes(1);
        expect(tenantModel.updateOne).toBeCalledWith({"id": "tenantId"}, {});

        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });

    it('test updateTenantPlan' , async() =>{
        stripeClient.subscriptions.del.mockReturnValue(Promise.resolve({}));
        stripeClient.subscriptions.create.mockReturnValue(Promise.resolve({}));
        tenantModel.exec.mockReturnValue(Promise.resolve({name: 'tenantModelResolved'}));

        let result = await catalogService.updateTenantPlan(tenantObject, 'newPlanCode');
        expect(result).toEqual({name: 'tenantModelResolved'});

        expect(stripeClient.subscriptions.del).toBeCalledTimes(1);
        expect(stripeClient.subscriptions.del).toBeCalledWith('1234');

        expect(stripeClient.subscriptions.create).toBeCalledTimes(1);
        expect(stripeClient.subscriptions.create).toBeCalledWith({"customer": "944848", "items": [{"plan": "newPlanCode", "quantity": 1}]});

        expect(tenantModel.updateOne).toBeCalledTimes(1);
        expect(tenantModel.updateOne).toBeCalledWith({"id": "test"}, {"id": "test", "paymentDetails": {"paymentMethod": {"id": 1234, "name": "master card"}, "stripeCustomerDetails": {"id": "944848"}, "stripeSubscription": {}, "subscribeTenant": true}, "subscriptionPlan": "newPlanCode"});
        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });

    it('test updateTenantPaymentMethod' , async() =>{
        let newPaymentMethod = {id: '949494'};
        stripeClient.paymentMethods.detach.mockReturnValue(Promise.resolve({}));
        stripeClient.paymentMethods.attach.mockReturnValue(Promise.resolve({}));
        stripeClient.customers.update.mockReturnValue(Promise.resolve({}));
        tenantModel.exec.mockReturnValue(Promise.resolve({name: 'tenantModelResolved'}));


        let result = await catalogService.updateTenantPaymentMethod(tenantObject, newPaymentMethod);
        expect(result).toEqual({name: 'tenantModelResolved'});

        expect(stripeClient.paymentMethods.detach).toBeCalledTimes(1);
        expect(stripeClient.paymentMethods.detach).toBeCalledWith(1234);

        expect(stripeClient.paymentMethods.attach).toBeCalledTimes(1);
        expect(stripeClient.paymentMethods.attach).toBeCalledWith(newPaymentMethod.id,{ customer: tenantObject.paymentDetails.stripeCustomerDetails.id });

        expect(stripeClient.customers.update).toBeCalledTimes(1);
        expect(stripeClient.customers.update).toBeCalledWith(tenantObject.paymentDetails.stripeCustomerDetails.id, {
            invoice_settings: {
              default_payment_method: newPaymentMethod.id,
            },
          });

        expect(tenantModel.updateOne).toBeCalledTimes(1);
        expect(tenantModel.updateOne).toBeCalledWith({"id": "test"}, {"id": "test", "paymentDetails": {"paymentMethod": {"id": "949494"}, "stripeCustomerDetails": {"id": "944848"}, "stripeSubscription": {}, "subscribeTenant": true}, "subscriptionPlan": "newPlanCode"});
        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });


    it('test isPlanCurrenlyUsed scenario 1', async () => {
        tenantModel.exec.mockReturnValue(Promise.resolve(['hello']));
        let result = await catalogService.isPlanCurrenlyUsed('plan name');
        expect(result).toEqual(true);
        expect(tenantModel.find).toBeCalledTimes(1);
        expect(tenantModel.find).toBeCalledWith({ subscriptionPlan: 'plan name' });

        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });

    it('test isPlanCurrenlyUsed scenario 2', async () => {
        tenantModel.exec.mockReturnValue(Promise.resolve([]));
        let result = await catalogService.isPlanCurrenlyUsed('plan name');
        expect(result).toEqual(false);
        expect(tenantModel.find).toBeCalledTimes(1);
        expect(tenantModel.find).toBeCalledWith({ subscriptionPlan: 'plan name' });

        expect(tenantModel.exec).toBeCalledTimes(1);
        expect(tenantModel.exec).toBeCalledWith();
    });



    describe('Test creaateTenant', ()=> {
        let newTenant = {};
        let createTenantSubscriptionOriginal = CatalogService.prototype.createTenantSubscription;
        let createTenantSubscriptionMocked;
        let createTenantAdminOriginal = CatalogService.prototype.createTenantAdmin;
        let createTenantAdminMocked ;
        let tenantObject, userObject;
        beforeEach(()=> {
            tenantModel = jest.fn().mockImplementation(() => {
                return {
                    newObj: jest.fn().mockImplementation(() => { return newTenant }),
                    save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
                    
                }});
            
            tenantModel.exec = jest.fn();
            tenantModel.deleteOne = jest.fn().mockImplementation(() => tenantModel);
            tenantModel.db = {};
            tenantModel.db.startSession = jest.fn().mockReturnValue(Promise.resolve(tenantModel.db));
            tenantModel.db.abortTransaction = jest.fn().mockReturnValue(Promise.resolve(tenantModel.db));
            tenantModel.db.endSession = jest.fn().mockReturnValue(Promise.resolve(tenantModel.db));
            tenantModel.db.startTransaction = jest.fn().mockReturnValue(tenantModel.db);


            catalogService = new CatalogService(
                tenantModel,
                userModel,
                invitationModel,
                taskModel,
                metadataTrackerProvider,
                authService,
                mailService,
                dsConnectionModel,
                clueModel,
                clueModelObject,
                datasetProvider,
                vizBookProvider,
                vizPageProvider,
                stripeClient
            );
            createTenantSubscriptionMocked = CatalogService.prototype.createTenantSubscription = jest.fn();
            createTenantAdminMocked = CatalogService.prototype.createTenantAdmin = jest.fn();
            tenantObject = {};
            userObject = {};
        });

        afterEach(() => {
            CatalogService.prototype.createTenantSubscription = createTenantSubscriptionOriginal;
            CatalogService.prototype.createTenantAdmin = createTenantAdminOriginal;
        });

        it('Test createTenant scenario 1', async ()=> {
            createTenantSubscriptionMocked.mockReturnValue(Promise.resolve({dataConnectionCount: 10}));
            createTenantAdminMocked.mockReturnValue(Promise.resolve({name: 'createTenantAdminMocked'}));
            let result = await catalogService.createTenant(tenantObject, userObject);
            expect(result).toEqual({name: 'createTenantAdminMocked'});
            expect(tenantModel.db.startSession).toBeCalledTimes(1);
            expect(tenantModel.db.startSession).toBeCalledWith();

            expect(tenantModel.db.startTransaction).toBeCalledTimes(1);
            expect(tenantModel.db.startTransaction).toBeCalledWith();

            expect(createTenantSubscriptionMocked).toBeCalledTimes(1);
            expect(createTenantSubscriptionMocked).toBeCalledWith(tenantObject, userObject);

            expect(createTenantAdminMocked).toBeCalledTimes(1);
            expect(createTenantAdminMocked).toBeCalledWith(userObject, expect.anything(), expect.anything(), {"name": "saved"});
        } );

        it('Test createTenant scenario 2', async ()=> {
            createTenantSubscriptionMocked.mockRejectedValue('Error');
            expect(catalogService.createTenant(tenantObject, userObject)).rejects.toEqual('Error');            
            //expect(tenantModel.db.abortTransaction).toBeCalledTimes(1);
            //expect(tenantModel.db.abortTransaction).toBeCalledWith();

            //expect(tenantModel.db.endSession).toBeCalledTimes(1);
            //expect(tenantModel.db.endSession).toBeCalledWith();

           } );

    });

    describe('Test createTenantAdmin, createUser and createUserWithTempPassword', ()=> {
        let createdUserInfo = {
            password: 'pass',
            firstName: 'firstName',
            lastName: 'lastName',
            userLanguage: 'userLanguage',
            userTimeZone: 'userTimeZone',
            username: 'fattah',
            name: {
                firstName: 'firstName',
                lastName: 'lastName',
            }
        };
        let tenantObject, userObject;

        beforeEach(()=> {
            userModel = jest.fn().mockImplementation(() => {
                return {
                    newObj: jest.fn().mockImplementation(() => { return {} }),
                    save: jest.fn().mockReturnValue(Promise.resolve(createdUserInfo)),
                    
                }});
            
            userModel.exec = jest.fn();
            userModel.db = {};
            userModel.db.startSession = jest.fn().mockReturnValue(Promise.resolve(userModel.db));
            userModel.db.abortTransaction = jest.fn().mockReturnValue(Promise.resolve(userModel.db));
            userModel.db.endSession = jest.fn().mockReturnValue(Promise.resolve(userModel.db));
            userModel.db.commitTransaction = jest.fn().mockReturnValue(Promise.resolve(userModel.db));
            userModel.db.startTransaction = jest.fn().mockReturnValue(userModel.db);

            tenantObject = {};
            userObject = {id: 12847, password: 'password'};
            catalogService = new CatalogService(
                tenantModel,
                userModel,
                invitationModel,
                taskModel,
                metadataTrackerProvider,
                authService,
                mailService,
                dsConnectionModel,
                clueModel,
                clueModelObject,
                datasetProvider,
                vizBookProvider,
                vizPageProvider,
                stripeClient
            );
        

        });

    it ('test createTenantAdmin scenario 1', async() => {
        authServiceMocked.hashEncryptedPassword.mockReturnValue(Promise.resolve({status : 0, data: 'data'}));
        let result = await catalogService.createTenantAdmin(userObject, {id: '1405485'}, userModel.db, tenantObject);
        expect(result).toEqual({"tenant": {}, "user": {"firstName": "firstName", "lastName": "lastName", "name": {"firstName": "firstName", "lastName": "lastName"}, "password": null, "userLanguage": "userLanguage", "userTimeZone": "userTimeZone", "username": "fattah"}});
        
        expect(authServiceMocked.hashEncryptedPassword).toBeCalledTimes(1);
        expect(authServiceMocked.hashEncryptedPassword).toBeCalledWith('password',expect.anything());


        expect(userModel.db.commitTransaction).toBeCalledTimes(1);
        expect(userModel.db.commitTransaction).toBeCalledWith();
        expect(userModel.db.endSession).toBeCalledTimes(1);
        expect(userModel.db.endSession).toBeCalledWith();

        expect(mailServiceMocked.sendMail).toBeCalledTimes(1);
        expect(mailServiceMocked.sendMail).toBeCalledWith("welcome", "fattah", {"name": "firstName lastName"});

    });

    it ('test createTenantAdmin scenario 2', async() => {
        authServiceMocked.hashEncryptedPassword.mockReturnValue(Promise.resolve({status : 10, data: 'data'}));
        expect(catalogService.createTenantAdmin(userObject, {id: '1405485'}, userModel.db, tenantObject)).rejects.toEqual(new Error('Unable to register tenant'));

    });

    it('test createUser scenario 1', async () => {

        let userObject;
        userObject = {tenantId : 1};
        let updateStripeSubQuantityOriginal = CatalogService.prototype.updateStripeSubQuantity;
        let updateStripeSubQuantityMocked = CatalogService.prototype.updateStripeSubQuantity = jest.fn();
        updateStripeSubQuantityMocked.mockReturnValue(Promise.resolve({name: 'updateStripe'}));
        let result = await catalogService.createUser(userObject);
        expect(result).toEqual({name: 'updateStripe'});
        expect(updateStripeSubQuantityMocked).toBeCalledWith(userObject.tenantId, 1);
        expect(updateStripeSubQuantityMocked).toBeCalledTimes(1);
        CatalogService.prototype.updateStripeSubQuantity = updateStripeSubQuantityOriginal;
    });

    it ('test createUserWithTempPassword scenario 1', async () => {
        let userObject ;
        userObject = {};
        passwordGenerator.generate = jest.fn().mockReturnValue('generatedPass');
        authServiceMocked.hashPlainPassword.mockResolvedValueOnce({status: 0, data: 'test data'});

        let result = await catalogService.createUserWithTempPassword(userObject);
        expect(result).toEqual({"data": {"firstName": "firstName", "lastName": "lastName", "name": {"firstName": "firstName", "lastName": "lastName"}, "password": null, "userLanguage": "userLanguage", "userTimeZone": "userTimeZone", "username": "fattah"}, "status": 0});
        expect(authServiceMocked.hashPlainPassword).toBeCalledTimes(1);
        expect(authServiceMocked.hashPlainPassword).toBeCalledWith('generatedPass', expect.anything());

        expect(mailServiceMocked.sendMail).toBeCalledTimes(1);
        expect(mailServiceMocked.sendMail).toBeCalledWith( "temp-password", "fattah", {"name": "firstName lastName", "newPassword": "generatedPass"});

    });

    it ('test createUserWithTempPassword scenario 2', async () => {
        let userObject ;
        userObject = {};
        passwordGenerator.generate = jest.fn().mockReturnValue('generatedPass');
        authServiceMocked.hashPlainPassword.mockResolvedValueOnce({status: 10, data: 'test data'});

        let result = await catalogService.createUserWithTempPassword(userObject);
        expect(result).toEqual({ status: -1, data: 'test data' });
        expect(authServiceMocked.hashPlainPassword).toBeCalledTimes(1);
        expect(authServiceMocked.hashPlainPassword).toBeCalledWith('generatedPass', expect.anything());

    });

    });



});