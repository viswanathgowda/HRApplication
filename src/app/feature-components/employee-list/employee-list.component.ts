import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { take } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [TableModule, FormsModule, DropdownModule, Toast],
  providers: [MessageService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  employeeList: any[] = [];
  roles = [
    { label: 'Select role', value: null, disabled: true },
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Employee', value: 'employee' },
  ];

  constructor(
    private firestore: FirestoreService,
    private auth: FireAuthService,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    this.firestore.getCollection(`users`).subscribe({
      next: (data: any) => {
        console.log('Employee List Data:', data);
        this.employeeList = data;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Unkown Error Occurred!. while fetching employee list',
        });
        console.error('Error fetching employee list:', error);
      },
    });
  }

  updateEmployee(event: any) {
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .getDoc(`users/${user.uid}`)
        .pipe(take(1))
        .subscribe((currentUserDetails) => {
          if (currentUserDetails.role !== 'admin') {
            this.messageService.add({
              severity: 'info',
              summary: 'Only admin can update employee details.',
            });
            return;
          }
          if (event && event.role === 'admin') {
            this.messageService.add({
              severity: 'info',
              summary: 'Cannot assign admin role to another user..',
            });
            return;
          }
          if (['admin'].includes(currentUserDetails.role)) {
            //only updating role for now
            this.firestore
              .updateDoc(`users/${event.docid}`, {
                role: event.role,
              })
              .then(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Employee role updated successfully',
                });
              })
              .catch((e) => {
                console.error(e);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error updating employee data.',
                });
              });
          }
        });
    });
  }
}
