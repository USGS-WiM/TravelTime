import {NgModule} from '@angular/core';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {MapComponent} from './components/map/map.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreComponent} from './core.component';

import {MapService} from './services/map.services';


@NgModule({
  declarations: [SidebarComponent, MapComponent, CoreComponent],
  imports: [LeafletModule.forRoot()],
  providers: [MapService],
  exports:[SidebarComponent, MapComponent, CoreComponent]
})
export class CoreModule { }
