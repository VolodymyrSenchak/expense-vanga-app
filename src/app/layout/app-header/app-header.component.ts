import {Component, inject} from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import {MatButtonModule} from '@angular/material/button';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {UserProfileComponent} from '../user-profile/user-profile.component';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {filter, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    UserProfileComponent,
    MatMenu,
    MatMenuTrigger,
  ]
})
export class AppHeader {
  readonly router = inject(Router);

  readonly pages = [
    { url: '/', name: 'Home' },
    { url: '/expected-expenses', name: 'Expected Expenses' },
    { url: '/currencies', name: 'Currencies' },
    { url: '/savings', name: 'Savings' },
  ];

  readonly currentPageName = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(e => (e as NavigationEnd).url),
      map(url => this.pages.find(page => page.url === url)?.name)
    )
  );
}
