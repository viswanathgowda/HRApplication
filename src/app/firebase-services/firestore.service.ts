import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  /**
   * Create or overwrite a document at a specified path
   * @param docPath Path of the document (e.g., "collection/docId")
   * @param data Data to write
   */
  async createDocument(docPath: string, data: any): Promise<void> {
    const documentRef = doc(this.firestore, docPath);
    return setDoc(documentRef, data);
  }

  /**
   * Add a new document to a collection
   * @param collectionPath Path of the collection (e.g., "collection")
   * @param data Data to add
   * @returns Promise<DocumentReference>
   */
  async addDocument(
    collectionPath: string,
    data: any
  ): Promise<DocumentReference> {
    const collectionRef = collection(this.firestore, collectionPath);
    return addDoc(collectionRef, data);
  }

  /**
   * Get a single document by path
   * @param docPath Path of the document (e.g., "collection/docId")
   * @returns Promise<T | null>
   */
  async getDoc<T>(docPath: string): Promise<T | null> {
    const documentRef = doc(this.firestore, docPath);
    const documentSnapshot = await getDoc(documentRef);

    if (documentSnapshot.exists()) {
      return documentSnapshot.data() as T;
    } else {
      return null;
    }
  }

  /**
   * Update fields in an existing document
   * @param docPath Path of the document (e.g., "collection/docId")
   * @param data Fields to update
   */
  async updateDoc(docPath: string, data: Partial<any>): Promise<void> {
    const documentRef = doc(this.firestore, docPath);
    return updateDoc(documentRef, data);
  }

  /**
   * Delete a document by path
   * @param docPath Path of the document (e.g., "collection/docId")
   */
  async deleteDoc(docPath: string): Promise<void> {
    const documentRef = doc(this.firestore, docPath);
    return deleteDoc(documentRef);
  }
}
