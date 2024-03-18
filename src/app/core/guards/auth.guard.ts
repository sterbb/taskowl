import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// import { AuthenticationService } from '../services/auth.service';
// import { AuthfakeauthenticationService } from '../services/authfake.service';

import { AuthService } from '../services/auth.service';

// import { environment } from '../../../environments/environment';

import { AccountsService } from '../services/account.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {

    accountData : any;


    constructor(
        private router: Router,
        private authenticationService: AuthService,
        // private authFackservice: AuthfakeauthenticationService,
        private accountService : AccountsService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('Executing canActivate guard');

        if (typeof localStorage !== 'undefined' && localStorage.getItem('id')) {
            console.log('User ID found in localStorage');
            return true;
        }else{
            console.log('User ID not found in localStorage. Redirecting to login page.');
            this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
            // this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
            return false;
    
        }


    }
}
