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
   * Upload a file to Firebase Storage with error handling
   * @param filePath Path to store the file (e.g., "uploads/myFile.txt")
   * @param file The file to upload
   * @returns Promise<string> The download URL of the uploaded file
   */
  async uploadFile(filePath: string, file: File): Promise<string> {
    try {
      if (!file) throw new Error('Invalid file input. File is required.');

      const storageRef = ref(this.storage, filePath);
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully:', uploadResult.metadata);

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error(`Failed to upload file to ${filePath}:`, error);
      throw new Error('File upload failed. Please try again.');
    }
  }

  /**
   * Get the download URL of a file in Firebase Storage with error handling
   * @param filePath Path of the file (e.g., "uploads/myFile.txt")
   * @returns Promise<string> The download URL or null if not found
   */
  async getFileURL(filePath: string): Promise<string | null> {
    try {
      const storageRef = ref(this.storage, filePath);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(`File not found at ${filePath}`);
        return null;
      }
      console.error(`Failed to get file URL for ${filePath}:`, error);
      throw new Error('Unable to retrieve file URL. Please try again.');
    }
  }

  /**
   * Delete a file from Firebase Storage with error handling
   * @param filePath Path of the file to delete (e.g., "uploads/myFile.txt")
   * @returns Promise<void>
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, filePath);
      await deleteObject(storageRef);
      console.log(`File at ${filePath} deleted successfully.`);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(`File not found at ${filePath}. Nothing to delete.`);
      } else {
        console.error(`Failed to delete file at ${filePath}:`, error);
        throw new Error('File deletion failed. Please try again.');
      }
    }
  }
}
