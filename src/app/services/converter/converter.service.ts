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
    const url:string = `https://free.currconv.com/api/v7/convert?q=${from}_${to}&compact=ultra&apiKey=0863168d8aafc72848b8`
    const rate:any = await firstValueFrom(this.http.get(url));
    
    return rate[`${from}_${to}`];
  }
}
