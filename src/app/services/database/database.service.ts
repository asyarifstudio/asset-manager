import { Injectable } from '@angular/core';
import { Asset } from 'src/app/model/asset.model';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { concatMap, firstValueFrom, map, Observable } from 'rxjs';
import { AssetEntry } from 'src/app/model/asset-entry.model';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private auth:AuthService, private firestore:AngularFirestore) { 

  }


  getAssets(includeEntry:boolean=false):Observable<Asset[]>{
    const coll = this.firestore.collection<Asset>(`users/${this.auth.user.id}/assets`)
    return coll.valueChanges({idField:"id"})
    
  }

  async createAsset(asset:Asset):Promise<Asset>{
    asset.createdAt = asset.updatedAt = Date.now();
    const coll = this.firestore.collection(`users/${this.auth.user.id}/assets`)
    const result = await coll.add(asset);
    const doc = this.firestore.doc(`users/${this.auth.user.id}/assets/${result.id}`);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"}));
    return data as Asset;
  }

  async addEntry(asset:Asset,entry:AssetEntry):Promise<AssetEntry>{
    entry.createdAt = entry.updatedAt = Date.now();
    const coll = this.firestore.collection(`users/${this.auth.user.id}/assets/${asset.id!}/entries`);
    const result = await coll.add(entry);
    const doc = this.firestore.doc(`users/${this.auth.user.id}/assets/${asset.id!}/entries/${result.id}`);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"}));
    return data as AssetEntry;
  }

  async updateEntry(asset:Asset,entryId:string,entry:AssetEntry):Promise<AssetEntry>{
    delete entry.id;
    const doc = this.firestore.doc<AssetEntry>(`users/${this.auth.user.id}/assets/${asset.id!}/entries/${entryId}`);
    await doc.set(entry);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"}));
    return data as AssetEntry;
  }

  getEntries(asset:Asset):Observable<AssetEntry[]>{
    const coll = this.firestore.collection<AssetEntry>(`users/${this.auth.user.id}/assets/${asset.id!}/entries`)
    return coll.valueChanges({idField:"id"})
  }



}
