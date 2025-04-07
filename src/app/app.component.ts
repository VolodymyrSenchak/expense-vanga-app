import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppHeader } from './layout/app-header/app-header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppHeader,
    MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'expense-vanga-app';
}
