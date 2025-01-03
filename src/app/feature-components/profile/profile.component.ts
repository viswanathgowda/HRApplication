import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

import { FireStorageService } from '../../firebase-services/fireStorage.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FirestoreService } from '../../firebase-services/firestore.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AvatarModule,
    AvatarGroupModule,
    AccordionModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    ToastModule,
    InputTextModule,
    AvatarModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    CommonModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  name = '';
  username = '';
  email = '';
  bio = '';
  phoneNumber = 0;
  currentAddress = '';
  perAddress = '';
  education = '';
  socialMedia = [
    { platform: 'LinkedIn', link: 'https://www.linkedin.com/in/johndoe' },
    { platform: 'Twitter', link: 'https://twitter.com/johndoe' },
    { platform: 'GitHub', link: 'https://github.com/johndoe' },
  ];
  profilePic: any; // Default profile picture
  uploadedFiles: any[] = [];

  // Bank Details
  bankDetails = {
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  };

  constructor(
    private messageService: MessageService,
    private fireStorage: FireStorageService,
    private auth: FireAuthService,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    this.getProfile();
    this.getProfileData();
  }

  getProfile() {
    this.auth
      .getCurrentUser()
      .then(async (user) => {
        const url = await this.fireStorage.getFileURL(`users/${user.uid}`);
        this.profilePic = url;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  getProfileData() {
    this.auth.getCurrentUser().then((user) => {
      this.firestore.getDoc(`users/${user.uid}`).subscribe((details) => {
        console.log(details);
        this.name = details.name;
        this.username = details.username;
        this.email = details.useremail;
        this.bio = details.bio;
        this.phoneNumber = details.phoneNumber;
        this.currentAddress = details.currentAddress;
        this.perAddress = details.permanentAddress;
        this.education = details.education;
      });
    });
  }

  handleUpload(event: any) {
    const file = event.files[0];
    this.auth.getCurrentUser().then(async (user) => {
      if (user) {
        try {
          const url = await this.fireStorage.getFileURL(`users/${user.uid}`);
          if (url) {
            await this.fireStorage.deleteFile(`users/${user.uid}`);
          }

          this.fireStorage.uploadFile(`users/${user.uid}`, file).then(() => {
            this.messageService.add({
              severity: 'info',
              summary: 'Profile Picture Uploaded Successfully.',
            });
            this.getProfile();
          });
        } catch (error) {
          console.error('Error during file operation:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ukown Error Occurred!.',
          });
        }
      }
    });
  }

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
      console.log(this.uploadedFiles);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  onSave() {
    const payload = {
      name: this.name,
      username: this.username,
      useremail: this.email,
      bio: this.bio,
      phoneNumber: this.phoneNumber,
      currentAddress: this.currentAddress,
      permanentAddress: this.perAddress,
      education: this.education,
    };
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .updateDoc(`users/${user.uid}`, payload)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Profile Data Updated Successfully',
          });
        })
        .catch((e) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Unkown Error Occurred!.',
          });
          console.error(e);
        });
    });
  }
}
