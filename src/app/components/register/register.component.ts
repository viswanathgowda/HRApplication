import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-register',
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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  regData: {
    email: string;
    password: string;
  } = { email: '', password: '' };
  constructor(
    private auth: FireAuthService,
    private firestore: FirestoreService,
    private router: Router
  ) {}

  register() {
    this.auth
      .register(this.regData.email, this.regData.password)
      .then((res: any) => {
        this.firestore
          .createDocument(`users/${res.user.uid}`, {
            email: res.user.email,
            lastLoginAt: res.user.reloadUserInfo.lastLoginAt,
          })
          .then(() => {
            this.router.navigate(['/login']);
          });
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
