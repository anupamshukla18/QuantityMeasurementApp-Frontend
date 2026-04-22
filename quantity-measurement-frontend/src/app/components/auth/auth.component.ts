import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLogin = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  authData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Handle redirect after Google OAuth2 login
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.authService.saveToken(params['token']);
        localStorage.setItem('user_email', params['email'] || 'google.user@gmail.com');
        localStorage.setItem('user_name', params['name'] || 'Google User');
        this.router.navigate(['/dashboard']);
      }
    });

    // If already logged in, go to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.successMessage = '';
  }

  handleAuth(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (this.isLogin) {
      // Real login via backend
      this.authService.login({ email: this.authData.email, password: this.authData.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.authService.saveToken(res.token);
          // Derive name from email for profile display
          const nameFromEmail = this.authData.email.split('@')[0];
          localStorage.setItem('user_email', this.authData.email);
          localStorage.setItem('user_name', nameFromEmail);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
        }
      });
    } else {
      // Real register via backend
      this.authService.register({
        name: this.authData.name,
        email: this.authData.email,
        password: this.authData.password
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created! Please log in.';
          this.isLogin = true;
          this.authData.password = '';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error || err.error?.message || 'Registration failed. Email may already be in use.';
        }
      });
    }
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
