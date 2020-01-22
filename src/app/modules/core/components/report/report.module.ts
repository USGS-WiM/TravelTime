import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { MapComponent } from '../map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapModule } from '../map/map.module';
import { ReportModalComponent } from './report.component';
import { CoreComponent } from '../../core.component';
import { CoreModule } from '../../core.module';

@NgModule({
  declarations: [ReportModalComponent],
  imports: [ 
    MapModule,
    CoreModule,
    BrowserModule
  ],
  bootstrap: [ReportModalComponent]
})
export class ReportModule { }
