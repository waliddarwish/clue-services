import { Injectable, HttpService, Inject } from '@nestjs/common';
import { NodeObject } from '../../object-schema/src/schemas/catalog.node';
import { TaskObject } from '../../object-schema/src/schemas/catelog.task';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly httpService: HttpService,
  ) { }

  async scheduleTask(task: TaskObject): Promise<any> {

    return this.httpService
      .put(
        'http://' +
        'scheduler' +
        ':' +
        '8350' +
        '/scheduler/task',
        task,
      )
      .toPromise()
      .then(result => {
        if (result && result.data && result.data.status === 0) {
          return result.data;
        } else {
          return { status: 5001, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 5001, message: 'Internal Error' };
      });

  }

  async getTaskInfo(taskId: string): Promise<any> {

    return this.httpService
      .get(
        'http://' +
        'scheduler' +
        ':' +
        '8350' +
        '/scheduler/get-task/' +
        taskId,
      )
      .toPromise()
      .then(result => {
        if (result && result.data && result.data.status === 0) {
          return result.data;
        } else {
          return { status: 5002, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 5002, message: 'Internal Error' };
      });

  }

  async cancelTask(taskId: string): Promise<any> {

    return this.httpService
      .get(
        'http://' +
        'scheduler' +
        ':' +
        '8350' +
        '/scheduler/cancel/' +
        taskId,
      )
      .toPromise()
      .then(result => {
        if (result && result.data && result.data.status === 0) {
          return result.data;
        } else {
          return { status: 5003, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 5003, message: 'Internal Error' };
      });

  }


  async getTenantTasks(tenantId: string): Promise<any> {

    return this.httpService
      .get(
        'http://' +
        'scheduler' +
        ':' +
        '8350' +
        '/scheduler/get-tasks/' +
        tenantId,
      )
      .toPromise()
      .then(result => {
        if (result && result.data && result.data.status === 0) {
          return result.data;
        } else {
          return { status: 5004, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 5004, message: 'Internal Error' };
      });

  }
}
