import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authFire:AngularFireAuth) { }


  isLogin():Observable<boolean>{
    return this.authFire.authState.pipe(
      map((user)=>{
        return user !== null;
      })
    )
  }

  loginWithGoogle(){
    this.authFire.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }


}
