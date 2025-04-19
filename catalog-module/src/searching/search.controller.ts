import { Controller, Get, Param, Body, Session, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { ApiOperation, ApiParam, ApiProperty, ApiBody, ApiTags, ApiHeader } from '@nestjs/swagger';

class SearchDTO {
  @ApiProperty()
  criteria: any;
  @ApiProperty()
  projections: any;
  @ApiProperty()
  options: any;
}

@Controller('search')
@ApiTags('Search')
@ApiHeader( { name : "passport" } )
export class SearchController {
  constructor(private readonly searchService: SearchService,
    private readonly globalizationService: GlobalizationService) { }

  @Post('connections/:page/:pageSize')
  @ApiOperation({ summary : 'Search connections and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchConnection(@Param() params, @Body() searchData : SearchDTO, @Session() session): Promise<any> {
    return this.searchScope('connections', params, searchData, session.user.tenantId);
  }

  @Post('tenants/:page/:pageSize')
  @ApiOperation({ summary : 'Search tenants and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchTenants(@Param() params, @Body() searchData): Promise<any> {
    return this.searchScope('tenants', params, searchData, null);
  }

  @Post('users/:page/:pageSize')
  @ApiOperation({ summary : 'Search users and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchUsers(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('users', params, searchData, session.user.tenantId);
  }

  @Post('invitations/:page/:pageSize')
  @ApiOperation({ summary : 'Search invitations and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchInvitations(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('invitations', params, searchData, session.user.tenantId);
  }

  @Post('models/:page/:pageSize')
  @ApiOperation({ summary : 'Search models and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchModels(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('models', params, searchData, session.user.tenantId);
  }

  @Post('model-objects/:page/:pageSize')
  @ApiOperation({ summary : 'Search model objects and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchModelObjects(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('modelObjects', params, searchData, session.user.tenantId);
  }

  @Post('metadata-task-tracker/:page/:pageSize')
  @ApiOperation({ summary : 'Search tasks and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchMetadataTaskTrackers(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('metadataTrackers', params, searchData, session.user.tenantId);
  }

  @Post('datasets/:page/:pageSize')
  @ApiOperation({ summary : 'Search datasets and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchDatasets(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('datasets', params, searchData, session.user.tenantId);
  }

  @Post('visualizations/:page/:pageSize')
  @ApiOperation({ summary : 'Search visulizations and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchVisualizations(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('visualizations', params, searchData, session.user.tenantId);
  }

  @Post('subscription-plans/:page/:pageSize')
  @ApiOperation({ summary : 'Search subscription plans and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchSubscriptions(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('subscriptions', params, searchData, session.user.tenantId);
  }

  @Post('visualizationPages/:page/:pageSize')
  @ApiOperation({ summary : 'Search visualization pages and returns a paginated result. Refer to mongodb documentation for search data' })
  @ApiParam({ name: 'page', required: true, type: 'string' })
  @ApiParam({ name: 'pageSize', required: true, type: 'string' })
  @ApiBody({ type: SearchDTO })
  async searchVisualizationPages(@Param() params, @Body() searchData, @Session() session): Promise<any> {
    return this.searchScope('visualizationPages', params, searchData, session.user.tenantId);
  }


  

  @Post('connections/count/:days')
  @ApiOperation({ summary: "Returns the count of connections added in n days"})
  @ApiParam({ name: 'days', required: true, type: 'number' })
  async getConnectionCount( @Param() params: any , @Body() searchData, @Session() session): Promise<any> {
      return this.searchService.getCount('connections' , params.days, searchData, session.user.tenantId).then((result) => {
          return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
              return { status: 0, message: theMessage, data: result };
          });
      }).catch((error) => {
          return this.globalizationService.get('en', '6002').then((theMessage: any): any => {
              return { status: 6002, message: theMessage, data: error };
          });
      });
  }

  @Post('users/count/:days')
  @ApiOperation({ summary: "Returns the count of connections added in n days"})
  @ApiParam({ name: 'days', required: true, type: 'number' })
  async getUsersCount( @Param() params: any , @Body() searchData, @Session() session): Promise<any> {
      return this.searchService.getCount('users' , params.days, searchData, session.user.tenantId).then((result) => {
          return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
              return { status: 0, message: theMessage, data: result };
          });
      }).catch((error) => {
          return this.globalizationService.get('en', '6002').then((theMessage: any): any => {
              return { status: 6002, message: theMessage, data: error };
          });
      });
  }

  @Post('datasets/count/:days')
  @ApiOperation({ summary: "Returns the count of connections added in n days"})
  @ApiParam({ name: 'days', required: true, type: 'number' })
  async getDatasetCount( @Param() params: any ,  @Body() searchData, @Session() session): Promise<any> {
      return this.searchService.getCount('datasets' , params.days, searchData, session.user.tenantId).then((result) => {
          return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
              return { status: 0, message: theMessage, data: result };
          });
      }).catch((error) => {
          return this.globalizationService.get('en', '6002').then((theMessage: any): any => {
              return { status: 6002, message: theMessage, data: error };
          });
      });
  }


  @Post('models/count/:days')
  @ApiOperation({ summary: "Returns the count of connections added in n days"})
  @ApiParam({ name: 'days', required: true, type: 'number' })
  async getModelCount( @Param() params: any ,  @Body() searchData, @Session() session): Promise<any> {
      return this.searchService.getCount('models' , params.days, searchData, session.user.tenantId).then((result) => {
          return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
              return { status: 0, message: theMessage, data: result };
          });
      }).catch((error) => {
          return this.globalizationService.get('en', '6002').then((theMessage: any): any => {
              return { status: 6002, message: theMessage, data: error };
          });
      });
  }

  @Post('visualizations/count/:days')
  @ApiOperation({ summary: "Returns the count of connections added in n days"})
  @ApiParam({ name: 'days', required: true, type: 'number' })
  async getVisualizationCount( @Param() params: any , @Body() searchData,  @Session() session): Promise<any> {
      return this.searchService.getCount('visualizations' , params.days, searchData, session.user.tenantId).then((result) => {
          return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
              return { status: 0, message: theMessage, data: result };
          });
      }).catch((error) => {
          return this.globalizationService.get('en', '6002').then((theMessage: any): any => {
              return { status: 6002, message: theMessage, data: error };
          });
      });
  }

  async searchScope(scope, params, searchData, tenantId: string): Promise<any> {
    if (!searchData) { searchData = {}; }
    if (!searchData.criteria) { searchData.criteria = {}; }
    if (!searchData.projections) { searchData.projections = {}; }
    if (!searchData.options) { searchData.options = {}; }

    return this.searchService.find(scope, searchData.criteria, searchData.projections,
      searchData.options, tenantId, +params.page, +params.pageSize).then((result: any): Promise<any> => {
        return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
          return { status: 0, message: theMessage, data: result };
        });
      }).catch((error) => {
        return this.globalizationService.get('en', '6001').then((theMessage: any): any => {
          return { status: 6001, message: theMessage, data: error };
        });
      });
  }
}
