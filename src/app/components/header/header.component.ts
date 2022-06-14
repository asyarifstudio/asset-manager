import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  $login:Observable<boolean>
  constructor(public auth:AuthService) {
    this.$login = this.auth.$isLogin;
   }

  ngOnInit(): void {
  }

  logout(){
    this.auth.logout();
  }
}
