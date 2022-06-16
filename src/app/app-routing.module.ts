import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetViewComponent } from './routes/asset-view/asset-view.component';
import { AssetComponent } from './routes/asset/asset.component';
import { HomeComponent } from './routes/home/home.component';

const routes: Routes = [
  {
    path:"",
    component:HomeComponent
  },
  {
    path:"aset",
    children:[
      {
        path:"",
        component:AssetComponent
      },
      {
        path:":id",
        component:AssetViewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
