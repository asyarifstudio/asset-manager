import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'asset-manager';
  
  $login:Observable<boolean>
  constructor(public auth:AuthService){
    this.$login = this.auth.$isLogin
  }

  
}
