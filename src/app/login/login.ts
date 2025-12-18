import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core'; import { FormsModule } from '@angular/forms'; import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  private returnUrl: string = '/';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submit() {
    this.error = null;
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        // Rediriger selon le rôle
        if (user.role === 'PARENT') {
          this.router.navigate(['/parent/dashboard']);
        } else if (user.role === 'TEACHER') {
          this.router.navigate(['/teacher/dashboard']);
        } else if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        }
        else {
          this.router.navigate(['/staff']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Email ou mot de passe incorrect';
        console.error(err);
      },
    });
  }
}
