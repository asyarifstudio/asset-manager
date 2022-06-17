import { Currency } from "src/app/model/asset.model";

export interface AssetValue{
    /**
     * Id of the entry in database
     */
    id:string,
    /**
     * name of the asset that own this entry
     */
    name:string,
    /**
     * currency of the asset that own this entry
     */
    currency:Currency
    /**
     * the amount of the entry in the original currency
     */
    amount:number,
    /**
     * amount in IDR
     */
    amountIDR:number
}
export interface AssetIncrement {
    total:number;
    monthlyInc:number;
    monthlyIncPer:number;
    yearToDateInc:number;
    yearToDateIncPer:number;
    overallInc:number;
    overallIncPer:number;
}
export interface AssetMonthlySummary{
    year:number
    month:number;
    monthText:string;
    assetValue:Map<string,AssetValue> //asset id and amount
    increment:Map<string,AssetIncrement>
}



export interface AssetSummary {
    monthly:AssetMonthlySummary[];
}