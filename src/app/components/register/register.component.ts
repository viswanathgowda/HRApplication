import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

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
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  regData: {
    email: string;
    password: string;
  } = { email: '', password: '' };
  isViewAsGuestUser: boolean = false;
  constructor(
    private auth: FireAuthService,
    private firestore: FirestoreService,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    this.auth.getCurrentUser().then((user) => {
      this.isViewAsGuestUser =
        user.uid === 'vFBApGwnruMfMqVOjngPWspY1wP2' ? true : false;
      console.log(this.isViewAsGuestUser);
    });
  }

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
            this.messageService.add({
              severity: 'info',
              summary: 'Registeration',
              detail: 'User Registered Successfully.',
            });
            this.regData = { email: '', password: '' };
          });
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
