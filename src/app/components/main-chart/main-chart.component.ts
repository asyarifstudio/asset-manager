import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Asset } from 'src/app/model/asset.model';
import { AssetSummary } from 'src/app/services/util/asset-summary';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-main-chart[assets]',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.scss']
})
export class MainChartComponent implements OnInit {

  @Input() assets!: Asset[];

  assetSummary?: AssetSummary;
  constructor(private util: UtilService) {
  
  }

  ngOnInit(): void {
    this.util.summarizeAsset(this.assets).then((value)=>{
      this.assetSummary = value;
    })
  }

  get
  chartData():ChartConfiguration['data']{
      let result: ChartConfiguration['data'] = {
          datasets:[
              {
                  data:this.assetSummary!.monthly.map((value)=>value.total),
                  label:'Total dalam IDR',
                  type:'bar'
                  
              }
          ],
          labels:this.assetSummary!.monthly.map((value)=>`${value.monthText} - ${value.year}` )

      };

      return result;
  }
}
