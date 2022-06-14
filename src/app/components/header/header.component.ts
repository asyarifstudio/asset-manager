import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Asset, Currency } from 'src/app/model/asset.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DatabaseService } from 'src/app/services/database/database.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  asset:Asset;

  $login:Observable<boolean>
  constructor(public auth:AuthService,
            private modal:NgbModal,
            private database:DatabaseService) {
    this.$login = this.auth.$isLogin;
    this.asset = {
      name:"",
      currency:Currency.IDR
    }
   }

  ngOnInit(): void {
  }

  logout(){
    this.auth.logout();
  }


  addAsset(content:any){
    this.modal.open(content).result.then(async ()=>{
      if(this.asset.name!=""){
        const result = await this.database.createAsset(this.asset);
        console.log(result);
      }
    },(error)=>{
      this.asset = {
        name:"",
        currency:Currency.IDR
      }
    })
  }

}
