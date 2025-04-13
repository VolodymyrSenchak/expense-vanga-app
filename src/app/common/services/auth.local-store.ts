import {Injectable} from '@angular/core';
import {Session, User} from '@common/models/auth';

@Injectable({ providedIn: "root" })
export class AuthStore {
  get user(): User | null {
    const userJson = localStorage.getItem('user-info');
    return userJson ? JSON.parse(userJson) as User : null;
  }

  set user(user: User | null) {
    this.setOrRemoveItem('user-info', user);
  }

  get session(): Session | null {
    const sessionJson = localStorage.getItem('session-info');
    return sessionJson ? JSON.parse(sessionJson) as Session : null;
  }

  set session(session: Session | null) {
    this.setOrRemoveItem('session-info', session);
  }

  clearAuth(): void {
    this.session = null;
    this.user = null;
  }

  private setOrRemoveItem<T>(key: string, value: T): void {
    if (!value) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
