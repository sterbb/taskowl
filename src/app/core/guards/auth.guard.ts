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

   

        // function getCookie(name) {
        //     const cookieString = document.cookie;
        //     const cookies = cookieString.split(';');
            
        //     for (let i = 0; i < cookies.length; i++) {
        //         const cookie = cookies[i].trim();
        //         if (cookie.startsWith(name + '=')) {
        //             return cookie.substring(name.length + 1, cookie.length);
        //         }
        //     }
            
        //     return null;
        // }
        
        // // Example usage:
        // const id = getCookie('id');

        if (typeof localStorage !== 'undefined' && localStorage.getItem('id')) {
            return true;
        }else{
            this.router.navigate(['signin'], { queryParams: { returnUrl: state.url } });

            // this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
            return false;
    
        }


        // // if (environment.defaultauth === 'firebase') {
        // //     const currentUser = this.authenticationService.currentUser();
        // //     if (currentUser) {
        // //         // logged in so return true
        // //         return true;
        // //     }
        // // } else {
        // //     const currentUser = this.authFackservice.currentUserValue;
        // //     if (currentUser) {
        // //         // logged in so return true
        // //         return true;
        // //     }
        // // }
        // // // not logged in so redirect to login page with the return url
        // this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        // return false;
    }
}
