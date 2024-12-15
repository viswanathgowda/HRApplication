import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    FloatLabel,
    PanelModule,
    CardModule,
    ButtonModule,
    TabViewModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginData: { userName: string; password: string } = {
    userName: '',
    password: '',
  };
  guestLoginData: { userName: string; password: string } = {
    userName: '',
    password: '',
  };

  onLogin() {
    console.log(this.loginData);
  }

  onGuestLogin() {
    console.log(this.guestLoginData);
  }

  onForgotPassword() {}
}
