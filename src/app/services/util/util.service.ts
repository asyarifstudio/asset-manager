import { Injectable } from '@angular/core';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from '../converter/converter.service';
import { AssetMonthlySummary, AssetSummary, AssetValue } from './asset-summary';

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
            assetValue:new Map<string,AssetValue>(),
            monthlyInc:0,
            monthlyIncPer:0,
            overallInc:0,
            overallIncPer:0,
            yearToDateInc:0,
            yearToDateIncPer:0
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

      //compute the increment
      for(let i=0;i<result.monthly.length - 1 ;i++){
        let current = result.monthly[i];
        let previous = result.monthly[i+1];
        current.monthlyInc = current.total - previous.total;
        current.monthlyIncPer = (current.monthlyInc * 100)/previous.total
      }

      //compute yearToDate Increment
      //compute increment from beginning;
      let begYear:number = 0;
      let currentYear:number = 0;
      let beginMonthly:AssetMonthlySummary = result.monthly[result.monthly.length-1];
      for(let monthly of result.monthly){
        if(currentYear!=monthly.year){
          //get new year
          currentYear = monthly.year;
          begYear = result.monthly.find((value)=>value.year == currentYear && value.month == 0)?.total!;
        }
        monthly.yearToDateInc = monthly.total - begYear;
        monthly.yearToDateIncPer = monthly.yearToDateInc*100/begYear;

        monthly.overallInc = monthly.total - beginMonthly.total;
        monthly.overallInc = monthly.overallInc*100/beginMonthly.total;
      }


      

    }

    return result;
  }
}
