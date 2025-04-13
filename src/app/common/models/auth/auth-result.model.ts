import {Session} from './session';
import {User} from './user';

export interface AuthResult {
  user: User;
  session: Session;
}
