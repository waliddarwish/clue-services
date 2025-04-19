import { Controller, Get, Body, Put, Delete, Param, Post } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { UserObject } from '../../../object-schema/src/schemas/catalog.user';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { TenantObject } from '../../../object-schema/src/schemas/catalog.tenant';
import { ApiOperation, ApiParam, ApiProperty, ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { DatasetService } from '../datasets/dataset.service';


class CreateTenantDTO {
  @ApiProperty()
  tenant: TenantObject;
  @ApiProperty()
  user: UserObject;
}

class UpadatePaymentMethodDTO { 
  @ApiProperty()
  tenant: TenantObject;
  @ApiProperty()
  newPaymentMethod: any ;

}

@Controller('catalog')
@ApiTags('User/Tenant Management')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService,
    private readonly globalizationService: GlobalizationService,
    private readonly datasetService: DatasetService) { }

  @Put('tenant')
  @ApiOperation({ summary: 'Create a tenant a query' })
  @ApiBody({ type: CreateTenantDTO })
  async createTenant(@Body() reqBody: CreateTenantDTO): Promise<any> {
    return this.catalogService.createTenant(reqBody.tenant, reqBody.user).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1003').then((theMessage: any): any => {
        return { status: 1003, message: theMessage, data: error };
      });
    });
  }


  @Get('tenant')
  @ApiOperation({ summary: 'Return all tenants' })
  @ApiHeader( { name : "passport" } )
  async findAllTenants(): Promise<any> {
    return this.catalogService.findAllTenants().then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '4001').then((theMessage: any): any => {
        return { status: 4001, message: theMessage, data: error };
      });
    });
  }

  @Get('tenantPlan/:tenantId')
  @ApiOperation({ summary: 'Returns the subscribtion plan for a tenant' })
  @ApiParam({ name: 'tenantId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async findTenantPlanId(@Param() params): Promise<any> {
    return this.catalogService.getTenantSubscriptionPlanId(params.tenantId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '4001').then((theMessage: any): any => {
        return { status: 4001, message: theMessage, data: error };
      });
    });
  }


  @Get('user/:tenantId')
  @ApiOperation({ summary: 'Returns list of usersfor a tenant' })
  @ApiParam({ name: 'tenantId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async findUsersByTenant(@Param() params): Promise<any> {
    return this.catalogService.findUsersByTenant(params.tenantId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '4002').then((theMessage: any): any => {
        return { status: 4002, message: theMessage, data: error };
      });
    });
  }


  @Delete('tenant/:tenantId')
  @ApiOperation({ summary: 'Delete a tenant and all its artifacts' })
  @ApiParam({ name: 'tenantId', required: true, type: 'string' })
  async deleteTenant(@Param() params): Promise<any> {
    return this.datasetService.deleteTenant(params.id).then((result) => {
      return this.catalogService.deleteTenant(params.tenantId).then((result: any): Promise<any> => {
        return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
          return { status: 0, message: theMessage, data: result };
        });
      }).catch((error) => {
        return this.globalizationService.get('en', '1005').then((theMessage: any): any => {
          return { status: 14016, message: theMessage, data: error };
        });
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '14016').then((theMessage: any): any => {
        return { status: 1005, message: theMessage, data: error };
      });
    });
  }

  @Get('subscriptionPlan')
  @ApiOperation({ summary: 'Returns available subscribtion plans' })
  @ApiHeader( { name : "passport" } )
  async getSubscriptionPlans(): Promise<any> {
    return this.catalogService.getSubscriptionPlan().then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      //TODO check with Walid on error code format
      return this.globalizationService.get('en', '1021').then((theMessage: any): any => {
        return { status: 1005, message: theMessage, data: error };
      });
    });
  }

  @Post('subscriptionPlan/:tenantId')
  @ApiOperation({ summary: 'Update the subscribtion plan for a tenant' })
  @ApiParam({ name: 'tenantId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async updateSubscriptionQuantity(@Param() params): Promise<any> {
    return this.catalogService.updateStripeSubQuantity(params.tenantId, 1).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      //TODO check with Walid on error code format
      return this.globalizationService.get('en', '1022').then((theMessage: any): any => {
        return { status: 1005, message: theMessage, data: error };
      });
    });
  }
  @Get('user/exists/:username')
  @ApiOperation({ summary: 'Checks if username is already taken' })
  @ApiParam({ name: 'username', required: true, type: 'string' })
  async userExists(@Param() params): Promise<any> {
    return this.catalogService.isUserExists(params.username).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1011').then((theMessage: any): any => {
        return { status: 1011, message: theMessage, data: error };
      });
    });
  }

  @Put('user')
  @ApiOperation({ summary: 'Creates a user' })
  @ApiBody({ type: UserObject })
  @ApiHeader( { name : "passport" } )
  async createUser(@Body() userObject: UserObject): Promise<any> {
    this.catalogService.createUser(userObject);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: 'Updates a user' })
  @ApiBody({ type: UserObject })
  @ApiParam({ name: 'userId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async updateUser(@Param() params, @Body() userObject: UserObject): Promise<any> {
    return this.catalogService.updateUser(params.userId, userObject).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1015').then((theMessage: any): any => {
        return { status: 1015, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }

  @Post('tenant/:tenantId')
  @ApiOperation({ summary: 'Updates a tenant' })
  @ApiBody({ type: TenantObject })
  @ApiParam({ name: 'tenantId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async updateTenantProfile(@Param() params, @Body() tenantObject: TenantObject): Promise<any> {
    return this.catalogService.updateTenant(params.tenantId, tenantObject).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1016').then((theMessage: any): any => {
        return { status: 1016, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }

  @Put('temp-password/user')
  @ApiOperation({ summary: 'Creates a user and email a temporary password to the user email' })
  @ApiBody({ type: UserObject })
  @ApiHeader( { name : "passport" } )
  async createUserWithTempPassword(@Body() userObject: UserObject): Promise<any> {
    return this.catalogService.createUserWithTempPassword(userObject).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1013').then((theMessage: any): any => {
        return { status: 1013, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }


  @Delete('user/:userId')
  @ApiOperation({ summary: 'Deletes a user ' })
  @ApiParam({ name: 'userId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async deleteUser(@Param() params): Promise<any> {
    return this.catalogService.deleteTenantUser(params.userId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1014').then((theMessage: any): any => {
        return { status: 1014, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }

  @Post('user/:userId/:status')
  @ApiOperation({ summary: 'Updates user status' })
  @ApiParam({ name: 'userId', required: true, type: 'string' })
  @ApiParam({ name: 'status', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async changeUserStatus(@Param() param): Promise<any> {
    return this.catalogService.changeUserStatus(param.userId, param.status).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1017').then((theMessage: any): any => {
        return { status: 1017, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }

  @Post('tenant/:tenantId/:status')
  @ApiOperation({ summary: 'Updates tenant status' })
  @ApiParam({ name: 'tenantId', required: true, type: 'string' })
  @ApiParam({ name: 'status', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async changeTenantStatus(@Param() param): Promise<any> {
    return this.catalogService.changeTenantStatus(param.tenantId, param.status).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1018').then((theMessage: any): any => {
        return { status: 1018, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }


  @Post('tenant/update-plan/:planCode')
  @ApiOperation({ summary: 'Updates subscription plan' })
  @ApiParam({ name: 'planCode', required: true, type: 'string' })
  @ApiBody({ type: TenantObject })
  @ApiHeader( { name : "passport" } )
  async updateTenantPlan(@Param() param, @Body() tenant: TenantObject): Promise<any> {
    return this.catalogService.updateTenantPlan(tenant, param.planCode).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1019').then((theMessage: any): any => {
        return { status: 1019, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }

  @Post('tenant/update-payment-method')
  @ApiOperation({ summary: 'Updates payment method for the tenant' })
  @ApiBody({ type: UpadatePaymentMethodDTO })
  @ApiHeader( { name : "passport" } )
  async updateTenantPaymentMethod(@Body() reqBody: UpadatePaymentMethodDTO): Promise<any> {
    return this.catalogService.updateTenantPaymentMethod(reqBody.tenant, reqBody.newPaymentMethod).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result.data };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1020').then((theMessage: any): any => {
        return { status: 1020, message: theMessage, data: JSON.stringify(error) };
      });
    });
  }
  @Get('tenant/:planCode')
  @ApiOperation({ summary: 'Checks if subscription plan is used by a tenant' })
  @ApiParam({ name: 'planCode', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async planIsCurrentUsed(@Param() params): Promise<any> {
    return this.catalogService.isPlanCurrenlyUsed(params.planCode).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1020').then((theMessage: any): any => {
        return { status: 1011, message: theMessage, data: error };
      });
    });
  }
}
