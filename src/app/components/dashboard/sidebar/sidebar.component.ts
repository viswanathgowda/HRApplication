import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MenuModule, BadgeModule, AvatarModule, RippleModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  menuItems: MenuItem[] = [];

  constructor(private router: Router) {
    this.menuItems = [
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
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => this.navigateTo('/settings'),
      },
    ];
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
