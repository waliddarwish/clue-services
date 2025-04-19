import { BaseTask } from './base-task';
import { TaskObject } from '../../../object-schema/src/schemas/catelog.task';

export class Task1 extends BaseTask {
  async executeTask(task: any): Promise<any> {
    super.postTaskExecution(task);
    return null;
  }
}
