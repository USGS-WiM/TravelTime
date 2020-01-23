import { NgModule } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapModule } from '../map/map.module';
import { ReportModalComponent } from './report.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ReportModalComponent],
  imports: [ 
    CommonModule,
    MapModule,
    LeafletModule,
    NgbModule,
    FormsModule
  ],
  entryComponents: [ReportModalComponent],
  exports: [
    ReportModalComponent
  ]
})
export class ReportModule { }
