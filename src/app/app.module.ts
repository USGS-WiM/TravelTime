import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LeftbarComponent } from './leftbar/leftbar.component';
import { ModalComponent } from './modal/modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from '../material-module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material';
import { MapComponent } from './map/map.component';
import { ContentsComponent } from './contents/contents.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
//import { ISubscription } from 'rxjs/Subscription';
//import { DragDropModule } from '@angular/cdk/drag-drop'; Object rearrangement

@NgModule({
  declarations: [
    AppComponent,
    LeftbarComponent,
    ModalComponent,
    MapComponent,
    ContentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    DemoMaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    NgbModule,
    LeafletModule.forRoot()
    //DragDropModule Object rearrangement
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent, ModalComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
