import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ProfileComponent } from './feature-components/profile/profile.component';
import { HomeComponent } from './feature-components/home/home.component';
import { PermissionsComponent } from './feature-components/permissions/permissions.component';
import { AttendanceComponent } from './feature-components/attendance/attendance.component';
import { EmployeeListComponent } from './feature-components/employee-list/employee-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  {
    path: 'forgotPwd',
    component: ForgotPasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [AuthGuard],
      },
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'attendance',
        component: AttendanceComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'employees',
        component: EmployeeListComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
