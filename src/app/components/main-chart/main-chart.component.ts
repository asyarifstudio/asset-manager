import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { fromEventPattern } from 'rxjs';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from 'src/app/services/converter/converter.service';
import { AssetSummary } from 'src/app/services/util/asset-summary';
import { UtilService } from 'src/app/services/util/util.service';
import * as chroma from 'chroma-js'

@Component({
  selector: 'app-main-chart[assets]',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.scss']
})
export class MainChartComponent implements OnInit {

  @Input() assets!: Asset[];

  assetSummary?: AssetSummary;
  SGD_TO_IDR:number = 0;
  constructor(private util: UtilService, private converter:ConverterService) {
    
  }

  ngOnInit(): void {
    this.init();
  }

  async init(){
    this.SGD_TO_IDR = await this.converter.getRate(Currency.SGD,Currency.IDR);
    this.assetSummary = await this.util.summarizeAsset(this.assets)
  }

  get
  chartData():ChartConfiguration['data']{
      let result: ChartConfiguration['data'] = {
          datasets:[
              {
                  data:this.assetSummary!.monthly.map((value)=>value.total),
                  label:'Total dalam IDR',
                  type:'line',
                  
              }
          ],
          labels:this.assetSummary!.monthly.map((value)=>`${value.monthText} - ${value.year}` )
      };

      //add dataset for each 
      let datasets = result.datasets;
      const colorScale = chroma.scale(['red','green','blue','yellow']);
      const scaleValue = 1/this.assets.length;
      let i=0;
      for(let asset of this.assets){

        let data:number[] = this.assetSummary!.monthly.map((value)=>{
          let amount = value.assetValue.get(asset.id!)!;
          if(amount){
            return asset.currency == Currency.SGD?amount.amount*this.SGD_TO_IDR:amount.amount;
          }
          else{
            return 0;
          }
        })
        datasets.push({
          data:data,
          label:asset.name,
          type:'bar',
          hidden:true,
          backgroundColor:colorScale(i).hex()
        })
        
        i+=scaleValue;
      
      }
      
      return result;
  }

  get
  chartOption():ChartConfiguration['options']{
    const option:ChartConfiguration['options'] = {
      plugins:{
        legend:{
          display:true,
          position:'bottom'
        }
      }
    }

    return option
  }
}
