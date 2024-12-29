import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
class fireFunctionsSerice {
  constructor(private functions: Functions) {}

  private async sendEmail(email: string): Promise<any> {
    return this.callFunction('sendEmail', { email });
  }

  private async callFunction(functionName: string, payload: any): Promise<any> {
    const collable = httpsCallable(this.functions, functionName);
    return collable(payload);
  }
}
