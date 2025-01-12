import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ImageModule } from 'primeng/image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { FireStorageService } from '../../firebase-services/fireStorage.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { arrayUnion } from 'firebase/firestore'; // Ensure proper import

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
    ImageModule,
    ProgressSpinnerModule,
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
  profilePic: any; // Default profile picture
  uploadedFiles: any[] = [];
  isLoading: boolean = false;

  // Bank Details needs to add
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
    this.getDocuments();
  }

  getProfile() {
    this.isLoading = true;
    this.auth
      .getCurrentUser()
      .then(async (user) => {
        const url = await this.fireStorage.getFileURL(
          `users/${user.uid}/profile`
        );
        this.profilePic = url;
        this.isLoading = false;
      })
      .catch((e) => {
        console.error(e);
        this.isLoading = false;
      });
  }

  getProfileData() {
    this.isLoading = true;
    this.auth.getCurrentUser().then((user) => {
      this.firestore.getDoc(`users/${user.uid}`).subscribe((details) => {
        if (details) {
          this.name = details.name;
          this.username = details.username;
          this.email = details.useremail;
          this.bio = details.bio;
          this.phoneNumber = details.phoneNumber;
          this.currentAddress = details.currentAddress;
          this.perAddress = details.permanentAddress;
          this.education = details.education;
          this.isLoading = false;
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Profile not found.',
          });
        }
      });
    });
  }

  handleUpload(event: any) {
    const file = event.files[0];
    this.auth.getCurrentUser().then(async (user) => {
      if (user) {
        try {
          const url = await this.fireStorage.getFileURL(
            `users/${user.uid}/profile`
          );
          if (url) {
            await this.fireStorage.deleteFile(`users/${user.uid}/profile`);
          }

          this.fireStorage
            .uploadFile(`users/${user.uid}/profile`, file)
            .then(() => {
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
    const files: any[] = [];
    this.auth.getCurrentUser().then((user) => {
      for (let file of event.files) {
        this.uploadedFiles.push(file);
        files.push(file.name);
        this.fireStorage.uploadFile(`users/${user.uid}/${file.name}`, file);
        console.log(this.uploadedFiles);
      }

      // Update the Firestore document with the array of file names
      this.firestore.updateDoc(
        `users/${user.uid}`, // Document path
        { documents: arrayUnion(...files) }, // Use arrayUnion to add file names
        'updatedAt' // Optional timestamp field
      );

      this.messageService.add({
        severity: 'info',
        summary: 'File Uploaded',
        detail: '',
      });
      this.getDocuments();
    });
  }

  getDocuments() {
    this.isLoading = true;
    this.auth.getCurrentUser().then((user) => {
      this.firestore.getDoc(`users/${user.uid}`).subscribe(async (details) => {
        const docs = details.documents ? details.documents : [];
        if (docs.length > 0) {
          for (let doc of docs) {
            const url = await this.fireStorage.getFileURL(
              `users/${user.uid}/${doc}`
            );
            this.uploadedFiles.push({ name: doc, url: url });
          }
        }
        this.isLoading = false;
      });
    });
  }

  // removeFile(file: { name: string; url: string }) {
  //   this.auth.getCurrentUser().then(async (user) => {
  //     await this.fireStorage.deleteFile(`users/${user.uid}/${file.name}`);
  //     await this.firestore.updateDoc(`users/${user.uid}`, {
  //       documents: arrayRemove(file.name),
  //     });
  //     this.messageService.add({
  //       severity: 'info',
  //       summary: 'File Removed',
  //       detail: `The file "${file.name}" has been removed.`,
  //     });
  //   });
  // }

  onSave() {
    this.isLoading = true;
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
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Profile Data Updated Successfully',
          });
        })
        .catch((e) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Unkown Error Occurred!.',
          });
          console.error(e);
        });
    });
  }
}
