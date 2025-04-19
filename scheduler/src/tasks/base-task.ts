import { TaskObject } from '../../../object-schema/src/schemas/catelog.task';
import { InjectSchedule, Schedule } from 'nest-schedule';

export class BaseTask {
  async preTaskExecution(task: any): Promise<any> {}
  async postTaskExecution(task: any): Promise<any> {}
  async executeTask(task: any): Promise<any> {}
}
