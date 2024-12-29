import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    CardModule,
    FloatLabel,
    ButtonModule,
    TooltipModule,
    PasswordModule,
    DividerModule,
    RouterModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email: string = '';
  constructor(private auth: FireAuthService) {}

  forgotPwd() {
    this.auth
      .resetPassword(this.email)
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
