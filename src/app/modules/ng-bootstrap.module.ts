import { NgModule } from "@angular/core";
import { NgbModalModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
    imports:[
        NgbModalModule,
        NgbTooltipModule
    ],
    exports:[
        NgbModalModule,
        NgbTooltipModule
    ]
})
export class NgBootstrap{

}