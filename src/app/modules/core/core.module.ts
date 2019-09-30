import {NgModule} from '@angular/core';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {MapComponent} from './components/map/map.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreComponent} from './core.component';
import {MatExpansionModule, MatInputModule} from '@angular/material';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressButtonsModule } from 'mat-progress-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MapService} from './services/map.services';
import { NavigationService } from './services/navigationservices.service';
import { StudyService } from './services/study.service';


@NgModule({
  declarations: [SidebarComponent, MapComponent, CoreComponent],
  imports: [LeafletModule.forRoot(), MatExpansionModule, MatInputModule, CommonModule, BrowserModule, MatProgressButtonsModule, BrowserAnimationsModule, FormsModule],
  providers: [MapService,NavigationService,StudyService],
  exports:[SidebarComponent, MapComponent, CoreComponent]
})
export class CoreModule { }
