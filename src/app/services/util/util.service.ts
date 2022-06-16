import { Injectable } from '@angular/core';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from '../converter/converter.service';
import { AssetSummary, AssetValue } from './asset-summary';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private converter:ConverterService) { }

  numberToMonth(month: number): string {
    let result: string = "";
    switch (month) {
      case 0: result = "Januari"; break;
      case 1: result = "Februari"; break;
      case 2: result = "Maret"; break;
      case 3: result = "April"; break;
      case 4: result = "Mei"; break;
      case 5: result = "Juni"; break;
      case 6: result = "Juli"; break;
      case 7: result = "Agustus"; break;
      case 8: result = "September"; break;
      case 9: result = "Oktober"; break;
      case 10: result = "November"; break;
      case 11: result = "Desember"; break;
    }
    return result;
  }

  async summarizeAsset(assets:Asset[]):Promise<AssetSummary>{
    let result:AssetSummary = {
      monthly:[]
    }

    const SGD_TO_IDR = await this.converter.getRate(Currency.SGD,Currency.IDR);

    //loop asset
    for(let asset of assets){

      //if no entry, break;
      if(asset.entries == undefined) break;

      for(let entry of asset.entries!){
        let monthly = result.monthly.find((value)=>value.month == entry.month && value.year == entry.year);

        if(monthly == undefined){
          monthly = {
            year:entry.year,
            month:entry.month,
            monthText:this.numberToMonth(entry.month),
            total:0,
            assetValue:new Map<string,AssetValue>()
          }

          result.monthly.push(monthly);
        }
        
        monthly.assetValue.set(asset.id!,{id:entry.id! ,amount:entry.amount});
        if(asset.currency == Currency.IDR){

          monthly.total += entry.amount;
        }
        else{
          monthly.total += (entry.amount*SGD_TO_IDR);
        }

      }


      //after it ready, perform sorting
      result.monthly = result.monthly.sort((a,b)=>{
        if(a.year != b.year){
          return b.year - a.year;
        }
        else{
          return b.month - a.month;
        }
      })
      

    }

    return result;
  }
}
