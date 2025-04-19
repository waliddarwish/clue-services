import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import calls = require('config/public.json');
import accessControlPolicy = require('config/access.control.policy.json');

let sharedRole: any;
let adminRoles: any;
let tenantRoles: any;
let modulerRoles: any;
let visualizerRoles: any;
let consumerRoles: any;

sharedRole = { ...accessControlPolicy.SharedRoles };
adminRoles = {
  ...accessControlPolicy.Admin,
  ...accessControlPolicy.TenantAdmin,
  ...accessControlPolicy.Modeller,
  ...accessControlPolicy.Visualizer,
  ...accessControlPolicy.Consumer,
};

tenantRoles = {
  ...accessControlPolicy.TenantAdmin,
  ...accessControlPolicy.Modeller,
  ...accessControlPolicy.Visualizer,
  ...accessControlPolicy.Consumer,
};

modulerRoles = {
  ...accessControlPolicy.Modeller,
  ...accessControlPolicy.Visualizer,
  ...accessControlPolicy.Consumer,
};

visualizerRoles = {
  ...accessControlPolicy.Visualizer,
  ...accessControlPolicy.Consumer,
};

consumerRoles = { ...accessControlPolicy.Consumer };

@Injectable()
export class SessionGuard implements CanActivate {

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validated = this.validateSession(context);
    return validated;
  }

  private validateSession(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const callRoute = context.getClass().name + '.' + context.getHandler().name;

    // public call. No need for session validation
    if (calls.public.indexOf(callRoute) !== -1) {
      return true;
    }

    if (
      ( request.session.token && request.session.token !== request.headers.passport) || !request.session.token
    ) {
      return false;
    }

    // 'Admin', 'TenantAdmin' , 'Modeller' , 'Visualizer' , 'Consumer']
    const userRole = request.session.user.role;
    if (sharedRole[callRoute] === 1) {
      return true;
    } else if (userRole === 'Admin') {
      if (adminRoles[callRoute] !== 1) {
        return false;
      } else {
        return true;
      }
    } else if (userRole === 'TenantAdmin') {
      if (tenantRoles[callRoute] !== 1) {
        return false;
      } else {
        return true;
      }
    } else if (userRole === 'Modeller') {
      if (modulerRoles[callRoute] !== 1) {
        return false;
      } else {
        return true;
      }
    } else if (userRole === 'Visualizer') {
      if (visualizerRoles[callRoute] !== 1) {
        return false;
      } else {
        return true;
      }
    } else if (userRole === 'Consumer') {
      if (consumerRoles[callRoute] !== 1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }

    return true;
  }
}
