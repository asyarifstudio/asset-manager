
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
    monthlyInc:number;
    monthlyIncPer:number;
    yearToDateInc:number;
    yearToDateIncPer:number;
    overallInc:number;
    overallIncPer:number;
}



export interface AssetSummary {
    monthly:AssetMonthlySummary[];
}