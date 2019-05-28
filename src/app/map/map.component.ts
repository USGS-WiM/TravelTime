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
    let mySite = new site ([this.Site_reference]);
    const marker = new L.marker([e.latlng.lat, e.latlng.lng], {
      //draggable: true,
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
        iconSize: [25, 35],
        iconAnchor: [30 / 2, 35]
      })
    }).on('click',
      this.swapElement(mySite['mylist'], 2, 3),
      this.onMarkerClick (mySite['mylist'],e.latlng.lat, e.latlng.lng,'upstream',['gage']),//));//
      this.onMarkerClick (mySite['mylist'],e.latlng.lat, e.latlng.lng,'downstream',['gage', 'flowline']));

    //this._MapService.getUpstream (mySite['mylist'], e.latlng.lat, e.latlng.lng, 'upstream', ['gage']);
    //this._MapService.getDownstream (mySite['mylist'], e.latlng.lat, e.latlng.lng, 'downstream', ['gage', 'flowline']);
    this._MapService.markers.push(marker);
  }

  onMarkerClick(e, lat, lng, cond, option) {

    e[0]['value']['coordinates'] = [ lng, lat]; // add lat long
    e[1]['value'] = cond;

    if (e[2].value instanceof Array) { //if array, set limit of 100, copy parameters into a tuple, else do nothing since it should be already set
      e[2].value[0].value = 100;
      e[2].value.splice(1,1);
      let myvar = new parameters (e[2].value[0]);
      e[2].value = myvar;
    }

    e[3]['value'] = option;

    this._GetNavigationService.postGage(e)
    .toPromise().then(data => {
      this.results.push(data)

      if (cond == 'upstream'){
        for (var i= 0; i<this.results[0]['features'].length; i++){
          const marker = new L.marker([this.results[0]['features'][i].geometry.coordinates[1],this.results[0]['features'][i].geometry.coordinates[0]], {
            //draggable: true,
            icon: L.icon({
              iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          })
          this._MapService.markers.push (marker);
        }
      } else {
        for (var i= 0; i<this.results[1]['features'].length; i++){
          const marker = new L.marker([this.results[1]['features'][i].geometry.coordinates[1],this.results[1]['features'][i].geometry.coordinates[0]], {
            //draggable: true,
            icon: L.icon({
              iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          })
          this._MapService.markers.push (marker);
        }

      }
    } 
    );

  }
}
