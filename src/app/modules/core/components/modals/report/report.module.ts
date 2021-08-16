import { NgModule } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapModule } from '../../map/map.module';
import { ReportComponent } from './report.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AppChartsModule } from '../../appcharts/appcharts.module';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [ReportComponent],
  imports: [ 
    CommonModule,
    MapModule,
    LeafletModule,
    NgbModule,
    FormsModule,
    AppChartsModule,
    BrowserModule
  ],
  entryComponents: [ReportComponent],
  exports: [
    ReportComponent
  ]
})
export class ReportModule { }
