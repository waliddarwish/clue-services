import { Controller, Body, Put, Get, Param } from "@nestjs/common";
import { GlobalizationService } from "../../../globalization-module/src/globalization.service";
import { TaskService } from "./task.service";
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { TaskObject } from "../../../object-schema/src/schemas/catelog.task";

@Controller('task')
@ApiTags('Tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService,
                private readonly globalizationService: GlobalizationService) { }

    @Put('add')
    @ApiOperation({ summary: 'Add a tast to scheduler' })
    @ApiBody({ type: TaskObject })
    @ApiHeader( { name : "passport" } )
    async scheduleTask(@Body() body: TaskObject): Promise<any> {
        return this.taskService.scheduleTask(body);
    }

    @Get('get/:taskId')
    @ApiOperation({ summary: 'Returns task information' })
    @ApiParam({ name: 'taskId', required: true, type: 'string' })
    @ApiHeader( { name : "passport" } )
    async getTaskDetails(@Param() params): Promise<any> {
        return this.taskService.getTaskInfo(params.taskId);
    }

    @Get('cancel/:taskId')
    @ApiOperation({ summary: 'Cancels a task information' })
    @ApiParam({ name: 'taskId', required: true, type: 'string' })
    @ApiHeader( { name : "passport" } )
    async cancelJob(@Param() params): Promise<any> {
        return this.taskService.cancelTask(params.taskId);
    }

    @ApiOperation({ summary: 'Returns all tasks for a tenant' })
    @ApiParam({ name: 'tenantId', required: true, type: 'string' })
    @Get('get-tasks/:tenantId')
    @ApiHeader( { name : "passport" } )
    async getTenantTasks(@Param() params): Promise<any> {
        return this.taskService.getTenantTasks(params.tenantId);
    }
}