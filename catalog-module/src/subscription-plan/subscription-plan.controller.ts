import {
  Controller,
  Put,
  Body,
  Post,
  Get,
  Delete,
  Param,
} from '@nestjs/common';

import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanObject } from '../../../object-schema/src/schemas/catelog.subscription-plan';
import { ApiOperation, ApiBody, ApiParam, ApiTags, ApiHeader } from '@nestjs/swagger';

@Controller('subscription-plan')
@ApiTags('Subscription Plans')
export class SubscriptionPlanController {
  constructor(
    private readonly globalizationService: GlobalizationService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) { }

  @Put()
  @ApiOperation({ summary : 'Creates a subscription plan' })
  @ApiBody({ type: SubscriptionPlanObject })
  @ApiHeader( { name : "passport" } )
  async addSubscriptionPlan(@Body() body: SubscriptionPlanObject): Promise<any> {
    return this.subscriptionPlanService.validateExistingStripeCodePlan(body)
      .then(result => {
        if (result !== null && result.length !== 0) {
          return this.globalizationService.get('en', '13008').then(
            (theMessage: any): any => {
              return { status: 13008, message: theMessage, data: null };
            },
          )
        } else {
          return this.subscriptionPlanService.add(body)
            .then(
              (result: any): Promise<any> => {
                return this.globalizationService.get('en', 'Success').then(
                  (theMessage: any): any => {
                    return { status: 0, message: theMessage, data: result };
                  },
                );
              },
            )
            .catch(error => {
              // tslint:disable-next-line: no-console
              return this.globalizationService.get('en', '13001').then(
                (theMessage: any): any => {
                  return { status: 13001, message: theMessage, data: error };
                },
              );
            })

        }
      }).catch(error => {
        return this.globalizationService.get('en', '13007').then(
          (theMessage: any): any => {
            return { status: 13007, message: theMessage, data: error };
          },
        );
      });
  }

  @Post(':planId')
  @ApiOperation({ summary : 'Updates a subscription plan' })
  @ApiBody({ type: SubscriptionPlanObject })
  @ApiHeader( { name : "passport" } )
  async updateSubscriptionPlan(@Param() param, @Body() body: SubscriptionPlanObject): Promise<any> {
    return this.subscriptionPlanService.validateEditedStripeCodePlan(body,param.planId)
      .then(result => {
        if (result !== null) {
          return this.globalizationService.get('en', '13008').then(
            (theMessage: any): any => {
              return { status: 13008, message: theMessage, data: null };
            },
          )
        } else {
            return this.subscriptionPlanService.update(param.planId, body)
              .then(result => {
                return this.globalizationService.get('en', 'Success').then(
                  (theMessage: any): any => {
                    return { status: 0, message: theMessage, data: result };
                  },
                );
              })
              .catch(error => {
                return this.globalizationService.get('en', '13002').then(
                  (theMessage: any): any => {
                    return { status: 13002, message: theMessage, data: error };
                  },
                );
              })
            }
          }).catch(error => {
              return this.globalizationService.get('en', '13007').then(
                (theMessage: any): any => {
                  return { status: 13007, message: theMessage, data: error };
                },
              );
            });
  }


  @Delete(':id')
  @ApiOperation({ summary : 'Deletes a subscription plan' })
  @ApiParam({ name: 'id', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async deleteSubscriptionPlan(@Param() param): Promise<any> {
    return this.subscriptionPlanService
      .delete(param.id)
      .then(
        (result: any): Promise<any> => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage: any): any => {
              return { status: 0, message: theMessage };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '13004').then(
          (theMessage: any): any => {
            return {
              status: 13004,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get()
  @ApiOperation({ summary : 'Returns all subscription plans' })
  async getAllSubscriptionPlans(): Promise<SubscriptionPlanObject[]> {
    return this.subscriptionPlanService
      .getAll()
      .then(
        (result) => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage) => {
              return { status: 0, message: theMessage, data: result };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '13003').then(
          (theMessage: any): any => {
            return {
              status: 13003,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get('active')
  @ApiOperation({ summary : 'Retruns active subscription plans' })
  async getAllActiveSubscriptionPlans(): Promise<SubscriptionPlanObject[]> {
    return this.subscriptionPlanService
      .getAllActive()
      .then(
        (result) => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage) => {
              return { status: 0, message: theMessage, data: result };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '13006').then(
          (theMessage: any): any => {
            return {
              status: 13006,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get(':id')
  @ApiOperation({ summary : 'Retruns a subscription plan by Id' })
  @ApiParam({ name: 'id', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async getSubscriptionPlan(@Param() param): Promise<SubscriptionPlanObject[]> {
    return this.subscriptionPlanService
      .get(param.id)
      .then(
        (result) => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage) => {
              return { status: 0, message: theMessage, data: result };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '13005').then(
          (theMessage: any): any => {
            return {
              status: 13005,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }
}
