import { UserRole } from './user-role.model';

export { UserRole } from './user-role.model';

export interface User {
  id?: number;
  username: string;
  email: string;
  role: UserRole;
  blocked: boolean;
}