import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FireStorageService {
  constructor(private storage: Storage) {}

  /**
   * Upload a file to Firebase Storage
   * @param filePath Path to store the file (e.g., "uploads/myFile.txt")
   * @param file The file to upload
   * @returns Promise<string> The download URL of the uploaded file
   */
  async uploadFile(filePath: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  /**
   * Get the download URL of a file in Firebase Storage
   * @param filePath Path of the file (e.g., "uploads/myFile.txt")
   * @returns Promise<string> The download URL
   */
  async getFileURL(filePath: string): Promise<string> {
    const storageRef = ref(this.storage, filePath);
    return getDownloadURL(storageRef);
  }

  /**
   * Delete a file from Firebase Storage
   * @param filePath Path of the file to delete (e.g., "uploads/myFile.txt")
   * @returns Promise<void>
   */
  async deleteFile(filePath: string): Promise<void> {
    const storageRef = ref(this.storage, filePath);
    return deleteObject(storageRef);
  }
}
