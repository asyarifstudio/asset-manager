import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Asset, Currency } from 'src/app/model/asset.model';
import { DatabaseService } from 'src/app/services/database/database.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent implements OnInit,OnDestroy {

  assets!:Asset[]
  asset:Asset;
  subs:Subscription[] = []
  constructor(private database:DatabaseService,private modal:NgbModal) { 
    this.asset = {
      name:"",
      currency:Currency.IDR
    }
  }
  ngOnDestroy(): void {
    for(let sub of this.subs){
      sub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.subs.push(this.database.$valueChanges.subscribe(()=>{
      this.init();
    }));
    
  }

  async init(){
    this.assets = await this.database.getAssets();
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

  onSelectAsset(asset:Asset){
    
  }

}
