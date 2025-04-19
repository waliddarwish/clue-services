import { Injectable } from "@nestjs/common";
import { SchedulerService} from '../../../scheduler-module/src/scheduler.service';
import { from } from "rxjs";
import { TaskObject } from "../../../object-schema/src/schemas/catelog.task";

@Injectable()
export class TaskService {

    constructor(private readonly schedulerService: SchedulerService) {
    }

    async scheduleTask(task: TaskObject): Promise<any> {
        return this.schedulerService.scheduleTask(task);
    }
    async getTaskInfo(taskId: string): Promise<any> {
        return this.schedulerService.getTaskInfo(taskId);
    }
    async cancelTask(taskId: string): Promise<any> {
        return this.schedulerService.cancelTask(taskId);
    }
    async getTenantTasks(tenantId: string): Promise<any> {
        return this.schedulerService.getTenantTasks(tenantId);
    }


 
}