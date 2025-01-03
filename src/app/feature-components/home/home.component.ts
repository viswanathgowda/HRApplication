import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    CommonModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  isSignedIn: boolean = false;
  isAllowedToSign: boolean = false;
  today: Date = new Date();
  signState_S: Subscription | undefined;

  constructor(
    private fireStore: FirestoreService,
    private auth: FireAuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    setInterval(() => {
      this.today = new Date();
    }, 1000);

    const month = this.today.getMonth(); // 0 = January, 1 = February, etc.
    const year = this.today.getFullYear();
    const day = String(this.today.getDate()).padStart(2, '0');
    const formattedMonth = `${month}-${year}`;
    const formattedDay = `${day}-${month + 1}-${year}`;

    const user = await this.auth.getCurrentUser();
    if (user) {
      this.signState_S = this.fireStore
        .getDoc(`attendance/${formattedMonth}/${user.uid}/${formattedDay}`)
        .subscribe((data: any) => {
          if (data && Object.hasOwn(data, 'signIn')) {
            data.signIn && data.signOut
              ? (this.isAllowedToSign = false)
              : (this.isAllowedToSign = true);
            data.signOut ? (this.isSignedIn = false) : (this.isSignedIn = true);
          } else {
            this.isAllowedToSign = true;
            this.isSignedIn = false;
          }
        });
    }
  }

  async toggleAttendance(event: Event) {
    const tempSignedInState = !this.isSignedIn;

    const location = await this.getCurrentLocation();

    const month = this.today.getMonth(); // 0 = January, 1 = February, etc.
    const year = this.today.getFullYear();
    const day = String(this.today.getDate()).padStart(2, '0');
    const formattedMonth = `${month}-${year}`;
    const formattedDay = `${day}-${month + 1}-${year}`;

    if (tempSignedInState) {
      this.auth
        .getCurrentUser()
        .then((res) => {
          if (res.uid) {
            this.fireStore
              .createDocument(
                `attendance/${formattedMonth}/${res.uid}/${formattedDay}`,
                { signInLocation: location },
                'signIn'
              )
              .then(() => {
                this.isSignedIn = true;
                this.messageService.add({
                  severity: 'info',
                  summary: 'Confirmed',
                  detail: 'You have signed in',
                });
              })
              .catch((e) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: `${e}`,
                });
                console.error(e);
              });
          }
        })
        .catch((e) => {
          console.error('Error getting current user:', e);
        });
    } else {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to sign out?',
        header: 'Sign Out',
        icon: 'pi pi-info-circle',
        acceptButtonStyleClass: 'p-button-danger p-button-text',
        rejectButtonStyleClass: 'p-button-text p-button-text',
        acceptIcon: 'none',
        rejectIcon: 'none',

        accept: () => {
          this.auth
            .getCurrentUser()
            .then((res) => {
              if (res.uid) {
                this.fireStore
                  .updateDoc(
                    `attendance/${formattedMonth}/${res.uid}/${formattedDay}`,
                    { signOutLocation: location },
                    'signOut'
                  )
                  .then(() => {
                    this.isSignedIn = false;
                    this.messageService.add({
                      severity: 'info',
                      summary: 'Info',
                      detail: 'You have signed out',
                    });
                  })
                  .catch((e) => {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: `${e}`,
                    });
                    console.error(e);
                  });
              }
            })
            .catch((e) => {
              console.error('Error getting current login details:', e);
            });
        },
        reject: () => {},
      });
    }
  }

  /**
   * Get the current location using the browser's geolocation API.
   * @returns A promise that resolves to the user's location as an object or `null` if unavailable.
   */
  getCurrentLocation(): Promise<any> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            };
            resolve(location);
          },
          () => {
            // Return null if an error occurs (e.g., permission denied, timeout, etc.)
            resolve(null);
          }
        );
      } else {
        // Geolocation not supported by the browser
        resolve(null);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.signState_S) {
      this.signState_S.unsubscribe();
    }
  }
}
