import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
 template: `<router-outlet />`,
})

export class App {
  protected readonly title = signal('frontend-school');
  constructor(private auth: AuthService) {}

  ngOnInit() {
    // Si token déjà présent → recharge qui je suis
    this.auth.loadCurrentUser().subscribe();
  }
}
