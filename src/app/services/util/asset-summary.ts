
export interface AssetValue{
    id:string,
    amount:number
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