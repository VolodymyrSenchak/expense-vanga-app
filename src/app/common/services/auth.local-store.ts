import {Injectable} from '@angular/core';
import {Session, User} from '@common/models/auth';
import {BehaviorSubject} from 'rxjs';
import {getFromLocalStorage, saveToLocalStorage} from '@common/utils/localStorage.utils';
import {loadGoogleIdentity} from '@common/utils/google-identity.utils';

@Injectable({ providedIn: "root" })
export class AuthStore {
  private readonly userStorageKey = 'user-info';
  private readonly sessionStorageKey = 'session-info';

  private readonly userSub = new BehaviorSubject<User | null>(getFromLocalStorage(this.userStorageKey));
  private readonly sessionSub = new BehaviorSubject<Session | null>(getFromLocalStorage(this.sessionStorageKey));

  readonly user$ = this.userSub.asObservable();
  readonly session$ = this.sessionSub.asObservable();
  readonly getSession = () => this.sessionSub.getValue();

  setUser(user: User | null): void {
    saveToLocalStorage(this.userStorageKey, user, true);
    this.userSub.next(user);
  }

  setSession(session: Session | null): void {
    saveToLocalStorage(this.sessionStorageKey, session, true);
    this.sessionSub.next(session);
  }

  clearAuth(): void {
    this.setUser(null);
    this.setSession(null);
  }

  logout(): void {
    this.clearAuth();
    // Otherwise Google silently re-picks the same account on the next sign-in.
    void loadGoogleIdentity()
      .then((google) => google.disableAutoSelect())
      .catch(() => undefined);
  }
}
