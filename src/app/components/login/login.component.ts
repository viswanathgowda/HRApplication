import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabel,
    CardModule,
    ButtonModule,
    DividerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginData: { email: string; password: string } = {
    email: '',
    password: '',
  };
  guestLoginData: { userName: string; password: string } = {
    userName: '',
    password: '',
  };
  isLoading: boolean = false;
  constructor(private auth: FireAuthService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.auth
      .signIn(this.loginData.email, this.loginData.password)
      .then((res) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard/home']);
      })
      .catch((e) => {
        this.isLoading = false;
        console.error(e);
      });
  }

  onGuestLogin() {
    console.log(this.guestLoginData);
  }

  onForgotPassword() {
    this.router.navigate(['/forgotPwd']);
  }

  viewAsGuest() {
    this.auth
      .signIn('aditinayak195@gmail.com', 'test@123')
      .then(() => {
        this.isLoading = false;
        this.router.navigate(['/dashboard/home']);
      })
      .catch((e) => {
        this.isLoading = false;
        console.error(e);
      });
  }
}
