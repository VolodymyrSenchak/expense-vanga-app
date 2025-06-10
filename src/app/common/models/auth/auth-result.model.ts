import {Session} from './session';
import {User} from './user';

export interface AuthResult {
  user: User;
  session: Session;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
}
