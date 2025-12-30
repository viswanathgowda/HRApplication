import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MegaMenuItem, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { MegaMenu } from 'primeng/megamenu';
import { ButtonModule } from 'primeng/button';
import { FireAuthService } from '../../../firebase-services/fireauth.service';
import { take } from 'rxjs';
import { FirestoreService } from '../../../firebase-services/firestore.service';

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
export class SidebarComponent implements OnInit {
  items: MegaMenuItem[] | undefined;

  tabs: any[] = [
    {
      label: 'Home',
      name: 'home',
      icon: 'pi pi-home',
      command: () => this.navigateTo('/dashboard/home'),
    },
    {
      label: 'Profile',
      name: 'profile',
      icon: 'pi pi-user',
      command: () => {
        this.navigateTo('/dashboard/profile');
      },
    },
    {
      label: 'Permissions',
      name: 'permissions',
      icon: 'pi pi-lock',
      command: () => this.navigateTo('/dashboard/permissions'),
    },
    {
      label: 'Attendance',
      name: 'attendance',
      icon: 'pi pi-calendar',
      command: () => this.navigateTo('/dashboard/attendance'),
    },
    {
      label: 'Employee List',
      name: 'employeelist',
      icon: 'pi pi-users',
      command: () => this.navigateTo('/dashboard/employeelist'),
    },
    {
      label: 'Register',
      name: 'register',
      icon: 'pi pi-pencil',
      command: () => this.navigateTo('/dashboard/register'),
    },
    {
      label: 'ToDo',
      name: 'todo',
      icon: 'pi pi-check-square',
      command: () => this.navigateTo('/dashboard/todo'),
    },
  ];

  constructor(
    private router: Router,
    private auth: FireAuthService,
    private messageService: MessageService,
    private firestore: FirestoreService
  ) {
    this.items = [
      {
        label: 'Home',
        name: 'home',
        icon: 'pi pi-home',
        command: () => this.navigateTo('/dashboard/home'),
      },
      {
        label: 'Profile',
        name: 'profile',
        icon: 'pi pi-user',
        command: () => {
          this.navigateTo('/dashboard/profile');
        },
      },
      {
        label: 'Attendance',
        name: 'attendance',
        icon: 'pi pi-calendar',
        command: () => this.navigateTo('/dashboard/attendance'),
      },
    ];
  }
  ngOnInit(): void {
    this.validateTabs();
  }

  validateTabs() {
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .getDoc(`users/${user.uid}`)
        .pipe(take(1))
        .subscribe((currentUserDetails) => {
          this.firestore
            .getDoc(`permissions/${currentUserDetails.role}`)
            .pipe(take(1))
            .subscribe({
              next: (rolePermissions) => {
                const tabsAllowed =
                  rolePermissions?.permissions
                    ?.filter((perm: any) => perm.view === true)
                    .map((perm: any) => perm.tabName.toLowerCase()) || [];

                const allowedTabs = this.tabs.filter((tab) =>
                  tabsAllowed.includes(tab?.name.toLowerCase())
                );

                this.items = [
                  ...(this.items ?? []),
                  ...allowedTabs.filter(
                    (tab) =>
                      !(this.items ?? []).some(
                        (item) =>
                          item.label?.toLowerCase() === tab.label.toLowerCase()
                      )
                  ),
                ];
              },
              error: (err) => {
                console.error('Error fetching role permissions:', err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Unable to load permissions.',
                });
              },
            });
        });
    });
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
