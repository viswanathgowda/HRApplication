import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  addDoc,
  collection,
  updateDoc,
  deleteDoc,
  DocumentReference,
  Timestamp,
  onSnapshot,
  WhereFilterOp,
  QueryConstraint,
  where,
  orderBy,
  limit,
  query,
  collectionData,
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

  getCollection(
    path: string,
    filters?: {
      key: string;
      filter: WhereFilterOp;
      val: string | string[] | boolean | Date | number | Record<string, any>;
    }[],
    lim?: number,
    order?: { key: string; direction: 'asc' | 'desc' },
    orCond?: boolean
  ): Observable<any> {
    const collectionRef = collection(this.firestore, path);
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (filters) {
      if (orCond) {
        // Firestore doesn't natively support OR conditions in a single query
        throw new Error(
          'Firestore does not support OR conditions natively. Handle OR logic client-side.'
        );
      } else {
        filters.forEach((filter) => {
          constraints.push(where(filter.key, filter.filter, filter.val));
        });
      }
    }

    // Add ordering
    if (order) {
      constraints.push(orderBy(order.key, order.direction));
    }

    // Add limit
    if (lim) {
      constraints.push(limit(lim));
    }

    // Build query
    const finalQuery = query(collectionRef, ...constraints);

    // Return observable with document data
    return collectionData(finalQuery, { idField: 'docid' });
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
