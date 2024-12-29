import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FireAuthService {
  constructor(private auth: Auth, private router: Router) {}

  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise<UserCredential>
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Register a new user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise<UserCredential>
   */
  async register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Send a password reset email to the user
   * @param email User's email
   * @returns Promise<void>
   */
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Sign out the currently authenticated user
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Get the currently authenticated user
   * @returns Current user or null if not authenticated
   */
  async getCurrentUser(): Promise<any> {
    // Assuming auth.currentUser is a property or a method that gives the current user.
    return new Promise<any>((resolve, reject) => {
      try {
        const user = this.auth.currentUser; // Retrieve the current user from the authentication service.
        resolve(user); // Resolve with the user or null.
      } catch (error) {
        reject(error); // Reject in case of error.
      }
    });
  }
}
