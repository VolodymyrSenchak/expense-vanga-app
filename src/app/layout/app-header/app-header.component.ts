import {Component, inject} from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import {MatButtonModule} from '@angular/material/button';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {UserProfileComponent} from '../user-profile/user-profile.component';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {filter, map, startWith} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {ThemeService} from '@common/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconButton,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    UserProfileComponent,
    MatMenu,
    MatMenuTrigger,
  ]
})
export class AppHeader {
  readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly pages = [
    { url: '/', name: 'Home' },
    { url: '/expected-expenses', name: 'Expected Expenses' },
    { url: '/currencies', name: 'Currencies' },
    { url: '/savings', name: 'Savings' },
  ];

  readonly currentPageName = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
      map(url => this.getPageName(url))
    ),
    { initialValue: this.getPageName(this.router.url) }
  );

  private getPageName(url: string): string {
    const path = url.split(/[?#]/)[0];
    return this.pages.find(page => page.url === path)?.name ?? 'Menu';
  }
}
