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


@NgModule({
  declarations: [
    AppComponent,
    AboutModalComponent,
    JobsonsModalComponent,
    NavbarComponent
    
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
    NgbModule.forRoot()
  ],
  providers: [NgbActiveModal],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent, AboutModalComponent, JobsonsModalComponent]
})
export class AppModule {}
