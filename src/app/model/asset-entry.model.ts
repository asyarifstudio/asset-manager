import { Model } from "./model";

export interface AssetEntry extends Model {
    amount:number;
    year:number;
    month:number;
}