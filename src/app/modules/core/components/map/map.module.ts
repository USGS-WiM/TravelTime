import { NgModule } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  declarations: [ MapComponent ],
  imports: [
    LeafletModule.forRoot()    
  ],
  exports: [ MapComponent ]
})
export class MapModule { }
