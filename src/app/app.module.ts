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


@NgModule({
  declarations: [
    AppComponent,
    AboutModalComponent,
    JobsonsModalComponent,
    ReportModalComponent,
    NavbarComponent,
    DateTimePickerComponent,
    ApptoolsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    NgbTabsetModule,
    ToastNoAnimationModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      progressAnimation:'decreasing',
      preventDuplicates: true,
      countDuplicates:true
    }),
    NgbModule.forRoot(),
    FormsModule, 
    ReactiveFormsModule
  ],
  providers: [NgbActiveModal],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent, AboutModalComponent, JobsonsModalComponent, DateTimePickerComponent, ApptoolsComponent]
})
export class AppModule {}
