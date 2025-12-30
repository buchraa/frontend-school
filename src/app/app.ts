import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { AppHeader } from './app-header/app-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
 templateUrl: './app.html',
})

export class App {
  protected readonly title = signal('frontend-school');
  constructor(private auth: AuthService) {}

  ngOnInit() {
    // Si token déjà présent → recharge qui je suis
    this.auth.loadCurrentUser().subscribe();
  }
}
