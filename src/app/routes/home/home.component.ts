import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Asset } from 'src/app/model/asset.model';
import { DatabaseService } from 'src/app/services/database/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit,OnDestroy {

  assets:Asset[] | undefined;
  subs:Subscription[] = [];
  constructor(private database:DatabaseService) {
    this.subs.push(this.database.getAssets().subscribe((assets)=>{
      this.assets = assets;
    }))
  }
  ngOnDestroy(): void {
    for(let sub of this.subs){
      sub.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

  onAddEntry(asset:Asset){

  }

}
