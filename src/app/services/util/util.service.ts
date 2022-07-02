import { Injectable } from '@angular/core';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from '../converter/converter.service';
import { AssetIncrement, AssetMonthlySummary, AssetSummary, AssetValue } from './asset-summary';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private converter: ConverterService) { }

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

  async summarizeAsset(assets: Asset[]): Promise<AssetSummary> {
    let result: AssetSummary = {
      monthly: []
    }

    const SGD_TO_IDR = await this.converter.getRate(Currency.SGD, Currency.IDR);

    //loop asset
    for (let asset of assets) {

      //if no entry, break;
      if (asset.entries == undefined) continue;

      for (let entry of asset.entries!) {
        let monthly = result.monthly.find((value) => value.month == entry.month && value.year == entry.year);

        if (monthly == undefined) {
          monthly = {
            year: entry.year,
            month: entry.month,
            monthText: this.numberToMonth(entry.month),

            assetValue: new Map<string, AssetValue>(),
            increment: new Map()
          }

          //set initial currency increment
          for (let currency of [Currency.IDR, Currency.SGD]) {
            monthly.increment.set(currency, {
              monthlyInc: 0,
              total: 0,
              monthlyIncPer: 0,
              overallInc: 0,
              overallIncPer: 0,
              yearToDateInc: 0,
              yearToDateIncPer: 0
            })
          }
          //set total increment
          monthly.increment.set('TOTAL', {
            monthlyInc: 0,
            total: 0,
            monthlyIncPer: 0,
            overallInc: 0,
            overallIncPer: 0,
            yearToDateInc: 0,
            yearToDateIncPer: 0
          })



          //push to table
          result.monthly.push(monthly);
        }

        let multiplier: number;

        switch (asset.currency) {
          case Currency.IDR: multiplier = 1; break;
          case Currency.SGD: multiplier = SGD_TO_IDR; break;
        }

        let assetvalue: AssetValue =
        {
          id: entry.id!,
          amount: entry.amount,
          name: asset.name,
          currency: asset.currency,
          amountIDR:multiplier*entry.amount,
        }


        monthly.assetValue.set(asset.id!, assetvalue);

        monthly.increment.get('TOTAL')!.total += entry.amount * multiplier;
        monthly.increment.get(asset.currency)!.total += entry.amount * multiplier;

      }

    }

    //after it ready, perform sorting
    result.monthly = result.monthly.sort((a, b) => {
      if (a.year != b.year) {
        return b.year - a.year;
      }
      else {
        return b.month - a.month;
      }
    })


    //compute the increment



    for (let i = 0; i < result.monthly.length - 1; i++) {




      let current = result.monthly[i];
      let previous = result.monthly[i + 1];

      for (let [key, value] of current.increment) {

        value.monthlyInc = value.total - previous.increment.get(key)!.total;
        value.monthlyIncPer = (value.monthlyInc * 100) / previous.increment.get(key)!.total;
      }
    }

    //compute yearToDate Increment
    //compute increment from beginning;
    let begYear!: AssetMonthlySummary;
    let currentYear: number = 0;
    let firstMonlty: AssetMonthlySummary = result.monthly[result.monthly.length - 1];
    for (let monthly of result.monthly) {
      if (monthly.year == 2018 && monthly.month == 11) {
      }

      if (currentYear != monthly.year) {
        //get new year
        currentYear = monthly.year;
        begYear = result.monthly.find((value) => value.year == currentYear && value.month == 0)!;
        //if undefined, meaning the earliest month is not january
        if (!begYear) {
          //search for earliest month
          const thatYearMonthly = result.monthly.filter((value) => value.year == currentYear);
          //within this year, find the smallest month normally it's the latest
          begYear = thatYearMonthly[thatYearMonthly.length - 1];

        }
      }


      for (let [key, value] of monthly.increment) {

        value.yearToDateInc = value.total - begYear.increment.get(key)!.total;
        value.yearToDateIncPer = (value.yearToDateInc * 100) / begYear.increment.get(key)!.total;
        value.overallInc = value.total - firstMonlty.increment.get(key)!.total;
        value.overallIncPer = (value.overallInc * 100) / firstMonlty.increment.get(key)!.total;

      }

    }

    return result;
  }
}
