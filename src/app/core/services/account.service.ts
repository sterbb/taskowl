import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  accountData: any;


  constructor(private http: HttpClient) { }

  baseUrl: string = "http://localhost/api/"

  signIn(data: any) {
      
      return this.http.post(this.baseUrl+'login.php', data);
  }
}
