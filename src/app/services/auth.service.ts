import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authFire:AngularFireAuth) { }


  get
  $isLogin():Observable<boolean>{
    return this.authFire.authState.pipe(
      tap((user)=>{
        //console.log(user)
      }),
      map((user)=>{
        if(user){
          return true;
        }
        else{
          return false;
        }
      })
    )
  }

  loginWithGoogle(){
    this.authFire.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout(){
    this.authFire.signOut();
  }


}
