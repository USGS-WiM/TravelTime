import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AboutModalComponent } from './components/about/about.component';
import {NgbTabsetModule,NgbModule,NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrModule, ToastNoAnimation, ToastNoAnimationModule} from 'ngx-toastr';
import { CoreModule } from './modules/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { SpillResponseComponent } from './modules/core/components/modals/spill-response/spill-response.component';
import { ReportComponent } from './modules/core/components/modals/report/report.component';
import { DateTimePickerComponent } from './modules/core/components/date-time-picker/date-time-picker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfigurationComponent } from './modules/core/components/modals/configuration/configuration.component';
import { GagesComponent } from './modules/core/components/modals/gages/gages.component';
import { ChartsModule } from 'ng2-charts';
//import { AppchartsComponent } from './modules/core/components/appcharts/appcharts.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapModule } from './modules/core/components/map/map.module';
import { AppRoutingModule } from './modules/core/core-routing.module';
import { ReportModule } from './modules/core/components/modals/report/report.module';
import { SpillPlanningComponent } from './modules/core/components/modals/spill-planning/spillplanning.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutModalComponent,
    SpillResponseComponent,
    DateTimePickerComponent,
    ConfigurationComponent,
    GagesComponent,
    SpillPlanningComponent
  ],
  imports: [
    LeafletModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    CoreModule,
    NgbTabsetModule,
    ChartsModule,
    MapModule,
    ReportModule,
    AppRoutingModule,
    ToastNoAnimationModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      progressAnimation:'decreasing',
      preventDuplicates: true,
      countDuplicates:true
    }),
    NgbModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  providers: [NgbActiveModal],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent, AboutModalComponent, SpillResponseComponent, DateTimePickerComponent, ConfigurationComponent, GagesComponent, SpillPlanningComponent]
})
export class AppModule {}
