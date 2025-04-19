import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { TaskObject } from '../../object-schema/src/schemas/catelog.task';


const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn()
};



describe('Test query generator module', () => {
    let httpService;
    let schedulerService;


    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SchedulerService,
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        schedulerService = await module.get<SchedulerService>(SchedulerService);
    });


    describe('Test scheduleTask', () => {
        let theTask: TaskObject = {
            id: '', taskType: '', schedulingType: '', schedulingString: '', taskParam: [], tenantId: ''
        };
        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "task scheduled"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.scheduleTask(theTask)).resolves.toEqual(result.data);
            expect(httpService.put).toBeCalledWith('http://scheduler:8350/scheduler/task', theTask);
        });


        it('will be fail', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "task failed to schedule"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.scheduleTask(theTask)).resolves.toEqual({ status: 5001, message: 'Internal Error' });
            expect(httpService.put).toBeCalledWith('http://scheduler:8350/scheduler/task', theTask);
        });

        it('toPromise will throw an exception', () => {
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(schedulerService.scheduleTask(theTask)).resolves.toEqual({ status: 5001, message: 'Internal Error' });
            expect(httpService.put).toBeCalledWith('http://scheduler:8350/scheduler/task', theTask);
        });
    });


    describe('Test getTaskInfo', () => {
        let theTaskId = '23';
        let taskInfoUrl = 'http://scheduler:8350/scheduler/get-task/23';
        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "task scheduled"
                }
            };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.getTaskInfo(theTaskId)).resolves.toEqual(result.data);
            expect(httpService.get).toBeCalledWith(taskInfoUrl);
        });


        it('will be fail', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "failed to get task info"
                }
            };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.getTaskInfo(theTaskId)).resolves.toEqual({ status: 5002, message: 'Internal Error' });
            expect(httpService.get).toBeCalledWith(taskInfoUrl);
        });

        it('toPromise will throw an exception', () => {
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(schedulerService.getTaskInfo(theTaskId)).resolves.toEqual({ status: 5002, message: 'Internal Error' });
            expect(httpService.get).toBeCalledWith(taskInfoUrl);
        });
    });



    describe('Test cancelTask', () => {
        let theTaskId = '23';
        let cancelTaskUrl = 'http://scheduler:8350/scheduler/cancel/23';
        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "task scheduled"
                }
            };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.cancelTask(theTaskId)).resolves.toEqual(result.data);
            expect(httpService.get).toBeCalledWith(cancelTaskUrl);
        });


        it('will be fail', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "failed to cancel task"
                }
            };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.cancelTask(theTaskId)).resolves.toEqual({ status: 5003, message: 'Internal Error' });
            expect(httpService.get).toBeCalledWith(cancelTaskUrl);
        });

        it('toPromise will throw an exception', () => {
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(schedulerService.cancelTask(theTaskId)).resolves.toEqual({ status: 5003, message: 'Internal Error' });
            expect(httpService.get).toBeCalledWith(cancelTaskUrl);
        });
    });


    describe('Test getTenantTasks', () => {
        let theTenantId = '25';
        let getTasksUrl = 'http://scheduler:8350/scheduler/get-tasks/25';
        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "got tenant tasks"
                }
            };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.getTenantTasks(theTenantId)).resolves.toEqual(result.data);
            expect(httpService.get).toBeCalledWith(getTasksUrl);
        });


        it('will be fail', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "failed to get tasks"
                }
            };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(schedulerService.getTenantTasks(theTenantId)).resolves.toEqual({ status: 5004, message: 'Internal Error' });
            expect(httpService.get).toBeCalledWith(getTasksUrl);
        });

        it('toPromise will throw an exception', () => {
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(schedulerService.getTenantTasks(theTenantId)).resolves.toEqual({ status: 5004, message: 'Internal Error' });
            expect(httpService.get).toBeCalledWith(getTasksUrl);
        });
    });
});