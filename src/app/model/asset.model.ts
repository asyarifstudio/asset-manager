import { Model } from "./model";


export enum Currency{
    IDR="IDR",
    SGD="SGD"
}

export interface Asset extends Model{
    name:string;
    currency:Currency
}