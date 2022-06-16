import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset } from 'src/app/model/asset.model';
import { DatabaseService } from 'src/app/services/database/database.service';
import { UtilService } from 'src/app/services/util/util.service';

interface InputRow {
  year: number,
  month: number,
  amount: number;
}

@Component({
  selector: 'app-asset-view',
  templateUrl: './asset-view.component.html',
  styleUrls: ['./asset-view.component.scss']
})
export class AssetViewComponent implements OnInit {

  edit: boolean = false;
  asset?: Asset;
  fromYear!: number;
  fromMonth!: number;
  toYear!: number;
  toMonth!: number;
  inputRows: InputRow[] = [];
  constructor(private route: ActivatedRoute, private database: DatabaseService,public util:UtilService) {
    const id = this.route.snapshot.paramMap.get('id');
    this.database.getAsset(id!,true).then((asset) => {
      this.asset = asset;
      const date = new Date();
      this.fromYear = date.getFullYear() - 1;
      this.fromMonth = 0;
      this.toYear = date.getFullYear();
      this.toMonth = date.getMonth();
  
      this.changeRow();

    }, (err) => { })

   
  }

  ngOnInit(): void {

  }

  async doEdit(){

    if(this.edit){

      //save all the value
      for(let row of this.inputRows){
        if(row.amount == 0) continue;//no need to save

        //check if already in entry
        let entry = this.asset?.entries?.find((value)=>value.year==row.year && value.month == row.month);

        if(entry){
          //already there, do update
          entry.amount = row.amount;
          await this.database.updateEntry(this.asset!, entry.id!,entry);
        }
        else{
          //create new one
          const entry:AssetEntry={
            year:row.year,
            month:row.month,
            amount:row.amount
          }
          await this.database.addEntry(this.asset!,entry);
        }
      }
    }

    this.edit = !this.edit
  }

  changeRow() {
    console.log('update row');
    this.inputRows = [];
    let i: number, j: number;

    for (i = this.fromYear; i <= this.toYear; i++) {
      let start: number = 0;
      let stop: number = 11;

      if (i == this.fromYear) {
        start = this.fromMonth;
      }

      if (i == this.toYear) {
        stop = this.toMonth;
      }

      for (j = start; j <= stop; j++) {
        this.inputRows.push({
          year: i,
          month: j,
          amount: 0
        })
      }

    }

    //see the asset if already exist
    if (this.asset?.entries) {
      for (let entry of this.asset?.entries!) {
        for (let row of this.inputRows) {

          if (row.year == entry.year && row.month == entry.month) {

            row.amount = entry.amount;
          }
        }
      }
    }


  }

}
