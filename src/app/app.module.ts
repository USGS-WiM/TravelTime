import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AboutModalComponent } from './components/about/about.component';
import { NavbarComponent} from './components/navbar/navbar.component';
import {NgbTabsetModule,NgbModule,NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrModule, ToastNoAnimation, ToastNoAnimationModule} from 'ngx-toastr';
import { CoreModule } from './modules/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { JobsonsModalComponent } from './modules/core/components/jobsons/jobsons.component';
import { ReportModalComponent } from './modules/core/components/report/report.component';
import { DateTimePickerComponent } from './modules/core/components/date-time-picker/date-time-picker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApptoolsComponent } from './modules/core/components/apptools/apptools.component';
import { ChartsModule } from 'ng2-charts';
//import { AppchartsComponent } from './modules/core/components/appcharts/appcharts.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapModule } from './modules/core/components/map/map.module';
import { AppRoutingModule } from './modules/core/core-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    AboutModalComponent,
    JobsonsModalComponent,
    NavbarComponent,
    DateTimePickerComponent,
    ApptoolsComponent,
    ReportModalComponent
  ],
  imports: [
    LeafletModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    CoreModule,
    NgbTabsetModule,
    ChartsModule,
    MapModule,
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
  entryComponents: [AppComponent, AboutModalComponent, JobsonsModalComponent, DateTimePickerComponent, ApptoolsComponent, ReportModalComponent]
})
export class AppModule {}
