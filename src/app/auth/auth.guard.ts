import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Location } from '@angular/common';
import { FirestoreService } from '../firebase-services/firestore.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private router: Router,
    private location: Location,
    private firestore: FirestoreService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.firestore
            .getDoc(`users/${user.uid}`)
            .pipe(take(1))
            .subscribe((currentUserDetails) => {
              console.log('Current User Details:', currentUserDetails.role);
              this.firestore
                .getDoc(`permissions/${currentUserDetails.role}`)
                .pipe(take(1))
                .subscribe({
                  next: (rolePermissions) => {
                    const tabsAllowed =
                      rolePermissions?.permissions
                        ?.filter((perm: any) => perm.view === true)
                        .map((perm: any) => perm.tabName.toLowerCase()) || [];

                    const routeTabName = state.url.split('/dashboard/')[1];

                    if (!tabsAllowed.includes(routeTabName)) {
                      if (this.defaultRouteForRole(state)) {
                        resolve(true);
                      } else {
                        this.router.navigate(['/dashboard/home']);
                        resolve(false);
                      }
                    } else {
                      resolve(true);
                    }
                  },
                  error: (err) => {
                    console.error('Error fetching role permissions:', err);
                    if (this.defaultRouteForRole(state)) {
                      resolve(true);
                    } else {
                      this.router.navigate(['/dashboard/home']);
                      resolve(false);
                    }
                  },
                });
            });
          // If the user is logged in and trying to access '/login' or '/dashboard/login', redirect to previous or default route
          if (state.url === '/dashboard/login' || state.url === '/login') {
            const previousRoute =
              this.location.path() &&
              this.location.path() !== '/login' &&
              this.location.path() !== '/dashboard/login'
                ? this.location.path()
                : '/dashboard/home'; // Default to home if no previous route
            this.router.navigate([previousRoute]);
            resolve(false);
          } else {
            resolve(true); // Allow navigation to other routes
          }
        } else {
          // If the user is not logged in, allow navigation to login or forgotPwd, but redirect other routes to login
          if (state.url === '/login' || state.url === '/forgotPwd') {
            resolve(true); // Allow access to login or forgotPwd
          } else {
            this.router.navigate(['/login']); // Redirect to login if trying to access protected routes
            resolve(false);
          }
        }
      });
    });
  }

  defaultRouteForRole(state: any): boolean {
    return (
      state.url === '/dashboard/home' ||
      state.url === '/dashboard/profile' ||
      state.url === '/dashboard/attendance'
    );
  }
}
