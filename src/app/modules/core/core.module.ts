import {NgModule} from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { MapComponent } from './components/map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CoreComponent } from './core.component';
import { MatExpansionModule, MatInputModule } from '@angular/material';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressButtonsModule } from 'mat-progress-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NavigationService } from './services/navigationservices.service';
import {MapService} from './services/map.services';
import { StudyService } from './services/study.service';
import { TravelTimeService } from './services/traveltimeservices.service';
import { AppchartsComponent } from './components/appcharts/appcharts.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [SidebarComponent, MapComponent, CoreComponent, FooterComponent, AppchartsComponent],
  imports: [LeafletModule.forRoot(), MatExpansionModule, MatInputModule, CommonModule, BrowserModule, MatProgressButtonsModule, BrowserAnimationsModule, ChartsModule],
  providers: [MapService, NavigationService, StudyService, TravelTimeService],
  exports: [SidebarComponent, MapComponent, CoreComponent, FooterComponent, AppchartsComponent]
})
export class CoreModule { }
