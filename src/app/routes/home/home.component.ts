import { Component, OnDestroy, OnInit } from '@angular/core';
import { async } from '@firebase/util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset } from 'src/app/model/asset.model';
import { DatabaseService } from 'src/app/services/database/database.service';


interface TableEntryData {
  asset:Asset;
  amount:number;
}

interface TableEntry{

  year:number;
  month:number;
  entries:TableEntryData[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit,OnDestroy {

  assets:Asset[] | undefined;
  subs:Subscription[] = [];
  currentAsset!:Asset;
  currentEntry!:AssetEntry;
  tableEntries:TableEntry[] = [];
  constructor(private database:DatabaseService,
              private modal:NgbModal) {
    

    this.initTableEntry();
    this.initEntry();
    
  }

  initEntry(){
    const date = new Date();
    this.currentEntry = {
      amount:0,
      year:date.getFullYear(),
      month:date.getMonth()
    }
  }

  initTableEntry(){
    firstValueFrom(this.database.getAssets()).then(async (assets)=>{
      for(let asset of assets){
        asset.entries = await firstValueFrom(this.database.getEntries(asset));
        //for each of the entry in the asset, loop through it to add to table entry
        for(let entry of asset.entries) {//#loop 1{
          let found:boolean = false;
          //search in the table entry if date already available
          for(let tableEntry of this.tableEntries) {//#loop 2{
            //table entry available, just add in the entry row
            if(entry.month == tableEntry.month && entry.year == tableEntry.year){
              tableEntry.entries.push({
                asset,
                amount:entry.amount
              })
              found = true;
              break;//stop #loop 2
            }
          }

          if(!found){
            //not found in the table entry,create new table Entry
            this.tableEntries.push({
              year:entry.year,
              month:entry.month,
              entries:[
                {
                  asset,
                  amount:entry.amount
                }
              ]
            })
          }
        }

        //after this, sort the table entry based on the year and month;

        this.tableEntries = this.tableEntries.sort((a,b)=>{
          if(a.year!=b.year){
            return b.year - a.year;
          }
          else{
            return b.month - a.month;
          }
        })
        
      }

    
      


      this.assets = assets;
    })
  }
  ngOnDestroy(): void {
    for(let sub of this.subs){
      sub.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

  onAddEntry(asset:Asset,content:any){
    this.currentAsset = asset;
    this.modal.open(content).result.then( async()=>{
      if(this.currentEntry.amount>0){
        await this.database.addEntry(this.currentAsset,this.currentEntry);
        this.initTableEntry();
      }
    },(error)=>{
      
    })
   
  }

  getAmount(asset:Asset,tableEntry:TableEntry){
    //search table entry
    for(let entry of this.tableEntries){
      if(entry.month == tableEntry.month && entry.year == tableEntry.year){
        for(let row of entry.entries){
          if(row.asset.id == asset.id){
            return row.amount;
          }
        }
      }
    }
    return "-";
  }

}
