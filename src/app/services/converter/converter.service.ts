import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Currency } from 'src/app/model/asset.model';

@Injectable({
  providedIn: 'root'
})
export class ConverterService {

  constructor(private http:HttpClient) {
    

  }

  async getRate(from:Currency, to:Currency):Promise<number>{
    
    const url:string = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`
    const rate:any = await firstValueFrom(this.http.get(url));
    // {
    //   "motd":{
    //     "msg":"If you or your company use this project or like what we doing, please consider backing us so we can continue maintaining and evolving this project.",
    //     "url":"https://exchangerate.host/#/donate"
    //   },
    //   "success":true,
    //   "base":"SGD",
    //   "date":"2022-06-16",
    //   "rates":
    //   {
    //     "IDR":10610.9028
    //   }
    // }
    return rate['rates'][to];
  }
}
