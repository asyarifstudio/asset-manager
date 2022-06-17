import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from 'src/app/services/converter/converter.service';
import { AssetSummary } from 'src/app/services/util/asset-summary';
import { UtilService } from 'src/app/services/util/util.service';
import * as chroma from 'chroma-js'
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
@Component({
  selector: 'app-main-chart[assets]',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.scss']
})
export class MainChartComponent implements OnInit {

  @Input() assets!: Asset[];

  assetSummary?: AssetSummary;
  SGD_TO_IDR: number = 0;
  constructor(private util: UtilService, private converter: ConverterService) {

  }

  ngOnInit(): void {
    this.init();
  }

  async init() {
    this.SGD_TO_IDR = await this.converter.getRate(Currency.SGD, Currency.IDR);
    this.assetSummary = await this.util.summarizeAsset(this.assets)
  }

  get
    progressChartData(): ChartConfiguration['data'] {
    let result: ChartConfiguration['data'] = {
      datasets: [
        {
          data: this.assetSummary!.monthly.map((value) => value.increment.get('TOTAL')!.total),
          label: 'Total',
          type: 'line',

        },
        {
          data: this.assetSummary!.monthly.map((value) => value.increment.get('SGD')!.total),
          label: 'Total SGD',
          type: 'bar',
        },
        {
          data: this.assetSummary!.monthly.map((value) => value.increment.get('IDR')!.total),
          label: 'Total IDR',
          type: 'bar',
        }
      ],
      labels: this.assetSummary!.monthly.map((value) => `${value.monthText} - ${value.year}`)

    };

    //add dataset for each 
    let datasets = result.datasets;
    const colorScale = chroma.scale(['red', 'green', 'blue', 'yellow']);
    const scaleValue = 1 / this.assets.length;
    let i = 0;
    for (let asset of this.assets) {

      let data: number[] = this.assetSummary!.monthly.map((value) => {
        let amount = value.assetValue.get(asset.id!)!;
        if (amount) {
          return asset.currency == Currency.SGD ? amount.amount * this.SGD_TO_IDR : amount.amount;
        }
        else {
          return 0;
        }
      })
      datasets.push({
        data: data,
        label: asset.name,
        type: 'bar',
        hidden: true,
        backgroundColor: colorScale(i).hex()
      })

      i += scaleValue;

    }

    return result;
  }

  get
    progressChartOption(): ChartConfiguration['options'] {
    const option: ChartConfiguration['options'] = {
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        title: {
          display: true,
          text: "Progress Aset"
        }
      }
    }

    return option
  }

  get
    percentageChartData(): ChartConfiguration['data'] {
    const totalAsset = this.assetSummary?.monthly[0].increment.get('TOTAL')?.total!;
    const lastSummary = [...this.assetSummary?.monthly[0]!.assetValue.values()!]
      .filter((value) => value.amount > 0)
      .sort((a, b) => {
        return a.amountIDR - b.amountIDR
      });
    let result: ChartConfiguration['data'] = {
      labels: lastSummary.map((value) => `${value.name} - ${((value.amountIDR*100)/totalAsset).toFixed(2)}%`),
      datasets: [
        {
          data: lastSummary.map((value) => {
            return value.amountIDR
          })
        }
      ],
    }


    return result;

  }

  get
    percentageChartOption(): ChartConfiguration['options'] {
    const option: ChartConfiguration['options'] = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          display:true,
          formatter:(value,context)=>{
            let label:string = context.chart.data.labels![context.dataIndex] as string;
            return label
          },
          font:{
            size:10
          }
        },
        title: {
          display: true,
          text: "Persentasi Aset"
        },

      },
      

    }

    return option
  }

  get
    percentageChartPlugin(): ChartConfiguration['plugins'] {
    return [pluginDataLabels.default];
  }

  get percentageChartLabel() {
    const lastSummary = [...this.assetSummary?.monthly[0]!.assetValue.values()!]
      .filter((value) => value.amount > 0)
      .sort((a, b) => {
        return a.amountIDR - b.amountIDR
      });
    
    return lastSummary.map((value) => `${value.name}`)
  }
}
