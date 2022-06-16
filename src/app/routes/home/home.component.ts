import { Component, OnDestroy, OnInit } from '@angular/core';
import { async } from '@firebase/util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartConfiguration } from 'chart.js';
import { firstValueFrom, last, Observable, Subscription } from 'rxjs';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from 'src/app/services/converter/converter.service';
import { DatabaseService } from 'src/app/services/database/database.service';
import { AssetMonthlySummary, AssetSummary } from 'src/app/services/util/asset-summary';
import { UtilService } from 'src/app/services/util/util.service';


interface RowData {
    id: string;
    amount: number;
}

interface TableColumn {
    year: number;
    month: number;
    rows: Map<string, RowData>; //asset ID and amount
    total:number;
}

interface YearSpan {
    year: number;
    column: number;
}


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {

    assets: Asset[] | undefined;
    subs: Subscription[] = [];
    currentAsset!: Asset;
    currentEntry!: AssetEntry;
    assetSummary?: AssetSummary;
    modalTitle: string = ""
    yearSpans: YearSpan[] = [];
    SGD_TO_IDR:number=0;
    constructor(private database: DatabaseService,
        private modal: NgbModal,
        private converter:ConverterService,
        private util:UtilService) {
        

        this.subs.push(
            this.database.$valueChanges.subscribe(() => {
                this.initTableEntry();
            })
        )
        this.initEntry();

    }

    initEntry() {
        const date = new Date();
        this.currentEntry = {
            amount: 0,
            year: date.getFullYear(),
            month: date.getMonth()
        }
    }

    async initTableEntry() {
        this.assets = undefined;
        this.yearSpans = [];


        const assets:Asset[] = await this.database.getAssets(true);
        this.assetSummary = await this.util.summarizeAsset(assets);
      
        //create yearspan for the table
        for (let column of this.assetSummary.monthly) {
            let found: boolean = false;
            for (let yearSpan of this.yearSpans) {
                if (yearSpan.year == column.year) {
                    yearSpan.column += 1;
                    found = true;
                    break;
                }
            }

            if (!found) {
                this.yearSpans.push({
                    year: column.year,
                    column: 1
                })
            }
        }

        this.assets = assets;
    }
    ngOnDestroy(): void {
        for (let sub of this.subs) {
            sub.unsubscribe();
        }
    }

    ngOnInit(): void {
    }

    onAddEntry(asset: Asset, content: any) {
        this.currentAsset = asset;
        this.modalTitle = `Tambah Entry ${asset.name}`
        this.modal.open(content).result.then(async () => {
            if (this.currentEntry.amount > 0) {
                await this.database.addEntry(this.currentAsset, this.currentEntry);
            }
        }, (error) => {

        })

    }

    onEdit(asset: Asset, column: AssetMonthlySummary, content: any) {
        this.currentAsset = asset;
        this.modalTitle = `Edit Entry ${asset.name}`
        const entry = column.assetValue.get(asset.id!);

        this.currentEntry = {
            year: column.year,
            month: column.month,
            amount: entry?entry.amount:0
        }
        const entryId: string = column.assetValue.get(asset.id!)?.id!;

        this.modal.open(content).result.then(async () => {
            if(entry){
                await this.database.updateEntry(this.currentAsset, entryId, this.currentEntry);
            }
            else{
                await this.database.addEntry(this.currentAsset,this.currentEntry);
            }
        }, (error) => {

        })
    }

    getAmount(asset: Asset, currentcolumn: AssetMonthlySummary) {
        //search table entry
        if (currentcolumn.assetValue.has(asset.id!)) {
            return currentcolumn.assetValue.get(asset.id!)!.amount
        }
        else {
            return ''
        }

    }
 
}
