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
  Timestamp,
  onSnapshot,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  /**
   * Create or overwrite a document at a specified path
   * @param docPath Path of the document (e.g., "collection/docId")
   * @param data Data to write
   * @param timestampFieldName Optional name of the timestamp field
   */
  async createDocument(
    docPath: string,
    data: any,
    timestampFieldName?: string
  ): Promise<void> {
    const time = timestampFieldName
      ? { [timestampFieldName]: Timestamp.now() }
      : {}; // Use an empty object if no timestampFieldName is provided

    const documentRef = doc(this.firestore, docPath);
    return setDoc(documentRef, { ...data, ...time }); // Merge data and timestamp (if provided)
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
   * @returns Observable<T | null>
   */
  getDoc(docPath: string): Observable<any> {
    return new Observable((observer) => {
      const documentRef = doc(this.firestore, docPath);
      const unsubscribe = onSnapshot(
        documentRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            observer.next(docSnapshot.data()); // Emit document data if it exists
          } else {
            observer.next(null); // If document doesn't exist, emit null
          }
        },
        (error) => {
          observer.error(error); // Handle error
        }
      );

      return () => unsubscribe(); // Unsubscribe to stop listening
    });
  }

  /**
   * Update fields in an existing document
   * @param docPath Path of the document (e.g., "collection/docId")
   * @param data Fields to update
   * @param timestampFieldName Optional name of the timestamp field
   */
  async updateDoc(
    docPath: string,
    data: Partial<any>,
    timestampFieldName?: string
  ): Promise<void> {
    const time = timestampFieldName
      ? { [timestampFieldName]: Timestamp.now() }
      : {}; // Use an empty object if no timestampFieldName is provided
    const documentRef = doc(this.firestore, docPath);
    return updateDoc(documentRef, { ...data, ...time });
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
