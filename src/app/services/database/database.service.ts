import { Injectable } from '@angular/core';
import { Asset } from 'src/app/model/asset.model';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { BehaviorSubject, concatMap, firstValueFrom, map, Observable } from 'rxjs';
import { AssetEntry } from 'src/app/model/asset-entry.model';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  $valueChanges:BehaviorSubject<any> = new BehaviorSubject({});

  constructor(private auth:AuthService, private firestore:AngularFirestore) { 

  }


  async getAssets(includeEntry:boolean=false):Promise<Asset[]>{
    const coll = this.firestore.collection<Asset>(`users/${this.auth.user.id}/assets`,ref=>ref.orderBy('name'))
    
    const result:Asset[] = await firstValueFrom(coll.valueChanges({idField:"id"}))

    if(includeEntry){
      for(let item of result){
        item.entries = await this.getEntries(item);
      }
    }
    return result;
    
  }

  async getAsset(id:string,includeEntry:boolean=false):Promise<Asset>{
    const doc = this.firestore.doc<Asset>(`users/${this.auth.user.id}/assets/${id}`);
    let asset:Asset = await firstValueFrom(doc.valueChanges({idField:"id"})) as Asset;

    if(includeEntry){
      asset.entries = await this.getEntries(asset);
    }

    return asset;
  }

  async createAsset(asset:Asset):Promise<Asset>{
    asset.createdAt = asset.updatedAt = Date.now();
    const coll = this.firestore.collection(`users/${this.auth.user.id}/assets`)
    const result = await coll.add(asset);
    const doc = this.firestore.doc(`users/${this.auth.user.id}/assets/${result.id}`);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"}));
    this.$valueChanges.next({})
    return data as Asset;
  }

  async addEntry(asset:Asset,entry:AssetEntry):Promise<AssetEntry>{
    entry.createdAt = entry.updatedAt = Date.now();
    const coll = this.firestore.collection(`users/${this.auth.user.id}/assets/${asset.id!}/entries`);
    const result = await coll.add(entry);
    const doc = this.firestore.doc(`users/${this.auth.user.id}/assets/${asset.id!}/entries/${result.id}`);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"}));
    this.$valueChanges.next({})
    return data as AssetEntry;
  }

  async updateEntry(asset:Asset,entryId:string,entry:AssetEntry):Promise<AssetEntry>{
    delete entry.id;
    const doc = this.firestore.doc<AssetEntry>(`users/${this.auth.user.id}/assets/${asset.id!}/entries/${entryId}`);
    await doc.set(entry);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"}));
    this.$valueChanges.next({})
    return data as AssetEntry;
  }

  getEntries(asset:Asset):Promise<AssetEntry[]>{
    const coll = this.firestore.collection<AssetEntry>(`users/${this.auth.user.id}/assets/${asset.id!}/entries`)
    return firstValueFrom(coll.valueChanges({idField:"id"}))
  }



}
