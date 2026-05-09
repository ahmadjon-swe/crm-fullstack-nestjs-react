
import { SetMetadata } from '@nestjs/common';
import { RolesAdmin} from 'src/shared/enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesAdmin[]) => SetMetadata(ROLES_KEY, roles);