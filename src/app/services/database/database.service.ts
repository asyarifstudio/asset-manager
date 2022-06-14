import { Injectable } from '@angular/core';
import { Asset } from 'src/app/model/asset.model';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private auth:AuthService, private firestore:AngularFirestore) { 

  }


  getAssets():Observable<Asset[]>{
    const coll = this.firestore.collection<Asset>(`users/${this.auth.user.id}/assets`)
    return coll.valueChanges({idField:"id"})
  }

  async createAsset(asset:Asset):Promise<Asset>{
    asset.createdAt = asset.updatedAt = Date.now();
    const coll = this.firestore.collection(`users/${this.auth.user.id}/assets`)
    const result = await coll.add(asset);
    const doc = this.firestore.doc(`users/${this.auth.user.id}/assets/${result.id}`);
    const data = await firstValueFrom(doc.valueChanges({idField:"id"})) as Asset;
    return data as Asset;
  }

}
