import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { Router } from '@angular/router';
import { FireAuthService } from '../../../firebase-services/fireauth.service';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [ToolbarModule, ButtonModule, ToastModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
  providers: [MessageService],
})
export class ToolbarComponent {
  constructor(
    private auth: FireAuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.auth
      .logout()
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Message Content',
        });
        this.router.navigate(['/login']);
      })
      .catch((e) => {
        console.error(`Ukown error occurred: ${e}`);
      });
  }
}
