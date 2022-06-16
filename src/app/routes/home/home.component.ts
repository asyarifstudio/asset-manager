import { Component, OnDestroy, OnInit } from '@angular/core';
import { async } from '@firebase/util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { AssetEntry } from 'src/app/model/asset-entry.model';
import { Asset, Currency } from 'src/app/model/asset.model';
import { ConverterService } from 'src/app/services/converter/converter.service';
import { DatabaseService } from 'src/app/services/database/database.service';


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
    tableColumn: TableColumn[] = [];
    modalTitle: string = ""
    yearSpans: YearSpan[] = [];
    SGD_TO_IDR:number=0;
    constructor(private database: DatabaseService,
        private modal: NgbModal,
        private converter:ConverterService) {
        

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
        this.tableColumn = [];
        this.yearSpans = [];

        if(this.SGD_TO_IDR==0){
            this.SGD_TO_IDR = await this.converter.getRate(Currency.SGD,Currency.IDR);
        }

        const assets:Asset[] = await firstValueFrom(this.database.getAssets());

        for (let asset of assets) {
            asset.entries = await firstValueFrom(this.database.getEntries(asset));
            //for each of the entry in the asset, loop through it to add to table entry
            for (let entry of asset.entries) {//#loop 1{
                let found: boolean = false;
                //search in the table entry if date already available
                for (let column of this.tableColumn) {//#loop 2{
                    //table entry available, just add in the entry row
                    if (entry.month == column.month && entry.year == column.year) {
                        column.rows.set(asset.id!, { id: entry.id!, amount: entry.amount })
                        if(asset.currency == Currency.SGD){
                            column.total += (entry.amount * this.SGD_TO_IDR);
                        }
                        else{
                            column.total += (entry.amount);
                        }
                        
                        found = true;
                        break;//stop #loop 2
                    }
                }

                if (!found) {
                    let map = new Map<string, RowData>();
                    map.set(asset.id!, { id: entry.id!, amount: entry.amount });
                    let total:number = entry.amount;
                    if(asset.currency == Currency.SGD){
                        total = total*this.SGD_TO_IDR;
                    }
                    //not found in the table entry,create new table Entry
                    this.tableColumn.push({
                        year: entry.year,
                        month: entry.month,
                        rows: map,
                        total
                    })
                }
            }
        }
        //after this, sort the table entry based on the year and month;
        this.tableColumn = this.tableColumn.sort((a, b) => {
            if (a.year != b.year) {
                return b.year - a.year;
            }
            else {
                return b.month - a.month;
            }
        })

        //create yearspan for the table
        for (let column of this.tableColumn) {
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

        //console.log(this.yearSpans);



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

    onEdit(asset: Asset, column: TableColumn, content: any) {
        this.currentAsset = asset;
        this.modalTitle = `Edit Entry ${asset.name}`
        this.currentEntry = {
            year: column.year,
            month: column.month,
            amount: column.rows.get(asset.id!)?.amount!
        }
        const entryId: string = column.rows.get(asset.id!)?.id!;

        this.modal.open(content).result.then(async () => {
            await this.database.updateEntry(this.currentAsset, entryId, this.currentEntry);
        }, (error) => {

        })
    }

    getAmount(asset: Asset, currentcolumn: TableColumn) {
        //search table entry
        if (currentcolumn.rows.has(asset.id!)) {
            return currentcolumn.rows.get(asset.id!)!.amount
        }
        else {
            return ''
        }

    }

    getMonth(month: number) {
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

}
