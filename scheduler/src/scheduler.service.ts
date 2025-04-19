import { Injectable } from '@nestjs/common';
import { TaskEntry, TaskSchema } from '../../database-module/src/database.schemas';
import { TaskObject } from '../../object-schema/src/schemas/catelog.task';
import { Task1 } from './tasks/task1';
import { Agenda } from 'agenda';
import { Connection, Model } from 'mongoose';
import { Schedule } from 'nest-schedule';
import { Task2 } from './tasks/task2';
import { ObjectId } from 'mongodb';
import { LogService } from '../../log-module/src/log.service';
import { LogCleanerTask } from './system-tasks/log-cleaner-task';
import uuidv4 = require('uuid/v4');
import config = require('config/config.json');
var taskModleInitialized = false;


@Injectable()
export class SchedulerService {
  private agenda: Agenda;
  private taskModel: Model<TaskEntry>;
  constructor(private readonly logService: LogService) {

  }

  initService(connection: Connection) {
    this.taskModel = connection.model('TaskEntry', TaskSchema, 'tasks');
    taskModleInitialized = true;
    
  }

  async initSystemTasks() {
    const logCleanerJob = await this.agenda.jobs({ name: 'LogCleaner' });
    if (logCleanerJob === null || logCleanerJob.length == 0) {
      var job = this.agenda.create('LogCleaner', {});
      job.repeatEvery(config.LogCleanerFrequency).save();
      this.agenda.now('LogCleaner', {});
    }
  }

  public setAgenda(theAgenda: Agenda) {
    this.agenda = theAgenda;
    this.agenda.start();
    new Promise(resolve => this.agenda.once('ready', resolve));




    this.agenda.define(
      'task1',
      {
        priority: 'normal',
        concurrency: 20,
        lockLimit: 1,
        lockLifetime: 10000,
      },
      async job => {
        await new Task1().executeTask(job.attrs.data);
      },
    );

    this.agenda.define('task2', async job => {
      new Task2().executeTask(job.attrs.data);
    });

    this.agenda.on('success', job => {
      if (!taskModleInitialized) {
        return;
      }
      this.taskModel
        .findOneAndUpdate(
          { agendaJobId: job.attrs._id },
          {
            $set: { status: 'completed' },
          },
        )
        .exec();
    });
    this.agenda.on('fail', job => {
      if (!taskModleInitialized) {
        return;
      }
      this.taskModel
        .findOneAndUpdate(
          { agendaJobId: job.attrs._id },
          {
            $set: { status: 'failed' },
          },
        )
        .exec();
    });

    this.agenda.on('start', job => {
      if (!taskModleInitialized) {
        return;
      }
      this.taskModel
        .findOneAndUpdate(
          { agendaJobId: job.attrs._id },
          {
            $set: { status: 'started' },
          },
        )
        .exec();
    });


    this.agenda.define(
      'LogCleaner',
      {
        priority: 'normal',
        concurrency: 1,
        lockLimit: 1,
        lockLifetime: 10000,
      },
      async job => {
        await new LogCleanerTask(this.logService).executeTask(job.attrs.data);
      },
    );


  }




  async scheduleTask(task: TaskObject): Promise<any> {
    var job;
    if (task.schedulingType === 'every') {
      job = await this.agenda.every(
        task.schedulingString,
        task.taskType,
        task.taskParam,
      );
    } else if (task.schedulingType === 'now') {
      job = await this.agenda.now(task.taskType, task.taskParam[0]);
    } else if (task.schedulingType === 'schedule') {
      job = await this.agenda.schedule(
        task.schedulingString,
        task.taskType,
        task.taskParam,
      );
    } else if (task.schedulingType === 'repeat') {
      job = this.agenda.create(task.taskType, task.taskParam);
      await job.repeatEvery(task.schedulingString).save();
    }
    if (job) {
      const taskObject = new this.taskModel();
      taskObject.id = uuidv4();
      taskObject.taskType = task.taskType;
      taskObject.schedulingString = task.schedulingString;
      //Task parameters are already saved in Agend. No need to save it again 
      taskObject.tenantId = task.tenantId;
      taskObject.agendaJobId = job.attrs._id;
      taskObject.schedulingType = task.schedulingType;
      taskObject.status = 'scheduled';
      return taskObject.save();
    }
  }

  async getTenantActiveTasks(tenantId: string): Promise<any> {
    return this.taskModel
      .find()
      .where('tenantId')
      .equals(tenantId)
      .exec();
  }

  async cancelTask(taskId: string): Promise<any> {
    const task = await this.taskModel.findOne().where('id').equals(taskId).exec();
    const cancelled = await this.agenda.cancel({ _id: ObjectId(task.agendaJobId) });
    task.status = 'cancelled';
    await task.save();
    return cancelled;
  }
  async getTaskInfo(taskId: string): Promise<any> {
    const task = await this.taskModel.findOne().where('id').equals(taskId).exec();
    const theJob = await this.agenda.jobs({ _id: ObjectId(task.agendaJobId) });
    return { task, theJob };

  }


  async deleteTenantTasks(tenantId: string): Promise<any> {
    let counter = 0;
    let tasks = await this.taskModel
      .find()
      .where('tenantId')
      .equals(tenantId)
      .exec();

    tasks.forEach(task => {
      this.agenda.cancel({ _id: ObjectId(task.agendaJobId) }).catch((error) => {
        // tslint:disable-next-line: no-console
        console.log(error);
      });

      this.taskModel.deleteOne({ id: task.id }).exec().catch((err) => {
        // tslint:disable-next-line: no-console
        console.log(err);
      });
      counter++;
    });

    return counter;

  }


  async startLogCleaner(task: TaskObject): Promise<any> {
    this.agenda.now('LogCleaner', task.taskParam);
  }
}

