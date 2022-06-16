
export interface AssetValue{
    id:string,
    amount:number
}
export interface AssetMonthlySummary{
    year:number
    month:number;
    monthText:string;
    total:number;
    assetValue:Map<string,AssetValue> //asset id and amount
}



export interface AssetSummary {
    monthly:AssetMonthlySummary[];
}