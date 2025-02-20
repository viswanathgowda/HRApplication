import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MegaMenuItem, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { MegaMenu } from 'primeng/megamenu';
import { ButtonModule } from 'primeng/button';
import { FireAuthService } from '../../../firebase-services/fireauth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    BadgeModule,
    AvatarModule,
    RippleModule,
    CommonModule,
    MegaMenu,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  items: MegaMenuItem[] | undefined;

  constructor(
    private router: Router,
    private auth: FireAuthService,
    private messageService: MessageService
  ) {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.navigateTo('/dashboard/home'),
      },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.navigateTo('/dashboard/profile');
        },
      },
      {
        label: 'Permissions',
        icon: 'pi pi-lock',
        command: () => this.navigateTo('/dashboard/permissions'),
      },
      {
        label: 'Attendance',
        icon: 'pi pi-calendar',
        command: () => this.navigateTo('/dashboard/attendance'),
      },
      {
        label: 'Employee List',
        icon: 'pi pi-users',
        command: () => this.navigateTo('/dashboard/employees'),
      },
      {
        label: 'Register',
        icon: 'pi pi-pencil',
        command: () => this.navigateTo('/dashboard/register'),
      },
    ];
  }

  goToProfile() {
    this.router.navigate(['/dashboard/profile']);
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

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  activeMenu(event: any) {
    // console.log(event, event.item);
    // let node;
    // if (event.target.tagName === 'A') {
    //   node = event.target;
    // } else {
    //   node = event.target.parentNode;
    // }
    // let menuitem = document.getElementsByClassName('ui-menuitem-link');
    // for (let i = 0; i < menuitem.length; i++) {
    //   menuitem[i].classList.remove('active');
    // }
    // node.classList.add('active');
  }
}
