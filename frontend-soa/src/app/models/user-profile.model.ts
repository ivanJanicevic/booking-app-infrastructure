import { User } from './user.model';

export interface UserProfile {
  id?: number;
  user?: User;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  biography: string;
  motto: string;
}