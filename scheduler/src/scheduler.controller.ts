import { Get, Controller, Param, Put, Body, Delete } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { GlobalizationService } from '../../globalization-module/src/globalization.service';
import { puts } from 'util';
import { Schedule } from 'nest-schedule';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly schedulerService: SchedulerService,
    private readonly globalizationService: GlobalizationService,
  ) {}

  @Put('task')
  async scheduleTask(@Body() reqBody: any): Promise<any> {
    return this.schedulerService
      .scheduleTask(reqBody)
      .then(result => {
        return this.globalizationService.get('en', 'Success').then(
          (theMessage: any): any => {
            return { status: 0, message: theMessage, data: result };
          },
        );
      })
      .catch(error => {
        return this.globalizationService.get('en', '5001').then(
          (theMessage: any): any => {
            return { status: 5001, message: theMessage, data: error };
          },
        );
      });
  }

  @Put('run-log-cleaner')
  async runLogCleaner(@Body() reqBody: any): Promise<any> {
    return this.schedulerService
      .startLogCleaner(reqBody)
      .then(result => {
        return this.globalizationService.get('en', 'Success').then(
          (theMessage: any): any => {
            return { status: 0, message: theMessage, data: result };
          },
        );
      })
      .catch(error => {
        return this.globalizationService.get('en', '5001').then(
          (theMessage: any): any => {
            return { status: 5001, message: theMessage, data: error };
          },
        );
      });
  }

  @Get('get-task/:taskId')
  async getTaskDetails(@Param() params): Promise<any> {
    return this.schedulerService
      .getTaskInfo(params.taskId)
      .then(result => {
        return this.globalizationService
          .get('en', 'Success')
          .then(theMessage => {
            return { status: 0, message: theMessage, data: result };
          });
      })
      .catch(error => {
        return this.globalizationService.get('en', '5002').then(
          (theMessage: any): any => {
            return {
              status: 5002,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get('cancel/:taskId')
  async cancelJob(@Param() params): Promise<any> {
    return this.schedulerService
      .cancelTask(params.taskId
        )
      .then(result => {
        return this.globalizationService
          .get('en', 'Success')
          .then(theMessage => {
            return { status: 0, message: theMessage, data: result };
          });
      })
      .catch(error => {
        return this.globalizationService.get('en', '5003').then(
          (theMessage: any): any => {
            return {
              status: 5003,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get('get-tasks/:tenantId')
  async getTenantTasks(@Param() params): Promise<any> {
    return this.schedulerService
      .getTenantActiveTasks(params.tenantId)
      .then(result => {
        return this.globalizationService
          .get('en', 'Success')
          .then(theMessage => {
            return { status: 0, message: theMessage, data: result };
          });
      })
      .catch(error => {
        return this.globalizationService.get('en', '5004').then(
          (theMessage: any): any => {
            return {
              status: 5004,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }


  @Delete('delete-tasks/:tenantId')
  async deleteTenantIds(@Param() params): Promise<any> {
    return this.schedulerService
      .deleteTenantTasks(params.tenantId
      )
      .then(result => {
        return this.globalizationService
          .get('en', 'Success')
          .then(theMessage => {
            return { status: 0, message: theMessage, data: result };
          });
      })
      .catch(error => {
        return this.globalizationService.get('en', '5003').then(
          (theMessage: any): any => {
            return {
              status: 5003,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }
}
