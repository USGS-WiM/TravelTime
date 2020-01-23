import { NgModule } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ MapComponent ],
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule    
  ],
  exports: [ 
    MapComponent 
  ]
})
export class MapModule { }
