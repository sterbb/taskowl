import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// import { AuthenticationService } from '../../../core/services/auth.service';
// import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { AuthService } from '../core/services/auth.service';

import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountsService } from '../core/services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm!: UntypedFormGroup;
  submitted:boolean = false;
  error:string = '';
  returnUrl!: string;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthService, private accountService: AccountsService) { 

    }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    // reset login status
    // this.authenticationService.logout();
    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      console.log(this.loginForm.value)

      this.accountService.signIn(this.loginForm.value).subscribe(
        (data:any)=>{

          console.log(data);

          // // Calculate expiration date
          // const expirationDate = new Date();
          // expirationDate.setDate(expirationDate.getDate() + 3); // Add 3 days

          // // Convert expiration date to string format
          // const expirationDateString = expirationDate.toUTCString();

          // // Set the cookie with the expiration date
          // document.cookie = `id=` + data.data.id + `; expires=${expirationDateString}; path=/`;

          // // localStorage.setItem('key', 'value');

          localStorage.setItem('id', data.data.id);
          localStorage.setItem('user_org', data.data.user_org);

          this.router.navigate(['/home']);
          
          
        },
        error=>{
          console.log(error);
          alert(error);
        });
    }
  }
}
