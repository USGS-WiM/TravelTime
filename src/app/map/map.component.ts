import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import { GetNavigationService } from '../services/get-navigation.service';
import { MapService } from '../services/map.service';
import {site} from '../site';


@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent implements OnInit {

  Site_reference: site;
  results = [];

  constructor(    
    private _GetNavigationService: GetNavigationService,
    private _MapService: MapService
  ) { }

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
    }).on ('click', //set hard limit to a value 100 km
      mySite['mylist'].pop(),
      this.onMarkerClick (mySite['mylist'],e.latlng.lat, e.latlng.lng,'upstream',['gage']),
      this.onMarkerClick (mySite['mylist'],e.latlng.lat, e.latlng.lng,'downstream',['gage', 'flowline']));

    this._MapService.markers.push(marker);
  }

  onMarkerClick (e, lat, lng, cond, option){

    e[0]['value']['coordinates'] = [ lng, lat]; // add lat long
    e[1]['value'] = cond;
    e[2]['value'] = option;
    //console.log (e[3])
    //e[3]['value'][0]['value'] = 100;
    //remove last element of array (not required one)
    let result;
    //post request
    this._GetNavigationService.postGage(e)
    .toPromise().then(data => {
      this.results.push(data)
      console.log (data);
    } 
    );
  }
}
