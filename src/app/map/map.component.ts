import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import { GetNavigationService } from '../services/get-navigation.service';
import { MapService } from '../services/map.service';
import {site, parameters} from '../site';
import {myfunctions} from '../shared/myfunctions';


@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent extends myfunctions implements OnInit {

  Site_reference: site;
  results = [];
  showLayer: boolean;

  constructor(
    private _GetNavigationService: GetNavigationService,
    private _MapService: MapService
  ) { super () }

  ngOnInit() {
    this._GetNavigationService.getRequiredConfig()
    .toPromise().then(data => {
      this.Site_reference = data['configuration'];
    }); //get service {description: Initial description}
  }
  
  onMapClick(e) {
    this.showLayer = true;
    let mySite = new site ([this.Site_reference]);
    const marker = new L.marker([e.latlng.lat, e.latlng.lng], {
      //draggable: true,
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
        iconSize: [25, 35],
        iconAnchor: [30 / 2, 35]
      })
    }).on('click',
      this.swapElement(mySite['mylist'], 2, 3));

    this.onMarkerClick(mySite['mylist'], e.latlng.lat, e.latlng.lng, 'upstream', ['gage'], 100);
    this.onMarkerClick(mySite['mylist'], e.latlng.lat, e.latlng.lng, 'downstream', ['gage', 'flowline'], 100);
    this._MapService.markers.push(marker);
    this._MapService.sites.push(marker);
  }

  onMarkerClick(e, lat, lng, cond, option, len) {

    e[0]['value']['coordinates'] = [ lng, lat]; // add lat long
    e[1]['value'] = cond;
    e[3]['value'] = option;
    //for upstream only
    if (e[2].value instanceof Array) { //if array, set limit of 100, copy parameters into a tuple, else do nothing since it should be already set
      e[2].value[0].value = len;
      e[2].value.splice(1,1);
      let myvar = new parameters (e[2].value[0]);
      e[2].value = myvar;
    }

    this._GetNavigationService.postGage(e)
      .toPromise().then(data => {
        if (cond == 'upstream') {
          this._MapService.getUpstream(data);

        } else {
          this._MapService.getDownstream(data);
          this.showLayer = false;
        }
        this.results.push(data)
      }
    );

  }
}
