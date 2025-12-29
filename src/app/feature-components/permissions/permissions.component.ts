import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { MessageService } from 'primeng/api';
import { take } from 'rxjs';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    CheckboxModule,
    DropdownModule,
    FormsModule,
    ListboxModule,
    ChipModule,
    ButtonModule,
    InputTextModule,
    Toast,
  ],
  providers: [MessageService],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
})
export class PermissionsComponent implements OnInit {
  // ROLE MASTER
  roles: any[] = [];
  newRole = '';
  selectedRole: any;

  currentUser: any;

  // TAB MASTER
  tabs: any[] = [];
  newTab = '';

  // PERMISSIONS
  permissions: any[] = [];

  constructor(
    private auth: FireAuthService,
    private firestore: FirestoreService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .getDoc(`users/${user.uid}`)
        .pipe(take(1))
        .subscribe((currentUserDetails) => {
          this.currentUser = currentUserDetails;
          this.loadRoles();
          this.loadTabs();
          this.loadPermissions();
        });
    });
  }

  addRole() {
    if (!this.newRole) return;
    if (this.currentUser?.role !== 'admin') {
      this.messageService.add({
        severity: 'info',
        summary: 'Only admin can add new roles.',
      });
      return;
    }
    this.firestore
      .createDocument(`roles/${this.newRole.toLowerCase()}`, {
        name: this.newRole.toLocaleLowerCase(),
        label: this.newRole
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: this.newRole.toLowerCase(),
      })
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Role added to Firestore',
        });
      })
      .catch((err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Unkown Error Occurred!. while adding role',
        });
      });
    this.newRole = '';
  }

  addTab() {
    if (!this.newTab) return;
    if (this.currentUser?.role !== 'admin') {
      this.messageService.add({
        severity: 'info',
        summary: 'Only admin can add new tabs.',
      });
      return;
    }
    this.firestore
      .createDocument(`tabs/${this.newTab.toLowerCase()}`, {
        name: this.newTab.toLocaleLowerCase(),
        label: this.newTab
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: this.newTab.toLowerCase(),
      })
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Tab added to Firestore',
        });
      })
      .catch((err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Unkown Error Occurred!. while adding Tab',
        });
      });

    this.newTab = '';
  }

  loadTabs() {
    if (this.currentUser?.role !== 'admin') {
      this.messageService.add({
        severity: 'info',
        summary: 'Only admin can view tabs.',
      });
      return;
    }
    this.firestore.getCollection('tabs').subscribe({
      next: (data: any) => {
        this.tabs = data;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Unkown Error Occurred!. while fetching tabs',
        });
        console.error('Error fetching tabs:', error);
      },
    });
  }

  loadRoles() {
    if (this.currentUser?.role !== 'admin') {
      this.messageService.add({
        severity: 'info',
        summary: 'Only admin can view roles.',
      });
      return;
    }
    this.firestore.getCollection('roles').subscribe({
      next: (data: any) => {
        this.roles = data.filter((role: any) => role.name !== 'select role');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Unkown Error Occurred!. while fetching roles',
        });
        console.error('Error fetching roles:', error);
      },
    });
  }

  loadPermissions() {
    if (!this.selectedRole?.name) return;
    if (this.currentUser?.role !== 'admin') {
      this.messageService.add({
        severity: 'info',
        summary: 'Only admin can view permissions.',
      });
      return;
    }
    const roleId = this.selectedRole.name.toLowerCase();
    const path = `permissions/${roleId}`;

    this.firestore.getDoc(path).subscribe(async (data) => {
      if (data) {
        // ✅ Document exists
        this.permissions = data.permissions || [];

        const missingTabs = this.tabs.filter(
          (tab) =>
            !data.permissions.some((perm: any) => perm.tabName === tab.name)
        );
        missingTabs.forEach((tab) => {
          this.permissions.push(this.getTabStructure(tab.name));
        });
      } else {
        // 🆕 Document does NOT exist → create empty permissions
        this.permissions = [];
        this.tabs.map((tab) => {
          this.permissions.push(this.getTabStructure(tab.name));
        });
      }
    });
  }

  getTabStructure(tab: any) {
    return {
      tabName: tab,
      role: this.selectedRole.name.toLowerCase(),
      view: false,
      create: false,
      edit: false,
      delete: false,
    };
  }

  savePermissions() {
    if (this.currentUser?.role !== 'admin') {
      this.messageService.add({
        severity: 'info',
        summary: 'Only admin can edit permissions.',
      });
      return;
    }
    const roleId = this.selectedRole.name.toLowerCase();
    const path = `permissions/${roleId}`;
    this.firestore
      .createDocument(
        path,
        {
          role: roleId,
          permissions: this.permissions,
        },
        'createdAt'
      )
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Permissions saved successfully',
        });
      })
      .catch((err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Unkown Error Occurred!. while saving permissions',
        });
      });
  }
}
