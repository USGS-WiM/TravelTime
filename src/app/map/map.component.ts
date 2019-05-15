import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import { GetNavigationService } from '../services/get-navigation.service';
import { MapService } from '../services/map.service';
import {Gage} from '../gage';


@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent implements OnInit {

  Gage_reference: Gage;

  constructor(    
    private _GetNavigationService: GetNavigationService,
    private _MapService: MapService
  ) { }

  ngOnInit() {
    this._GetNavigationService.getRequiredConfig()
    .toPromise().then(data => {
      this.Gage_reference = data['configuration'];
    }); //get service {description: Initial description}
  }

  onMapClick(e) {
    let myGage = new Gage ([this.Gage_reference]);

    const marker = new L.marker([e.latlng.lat, e.latlng.lng], {
      draggable: true,
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
        iconSize: [25, 35],
        iconAnchor: [30 / 2, 35]
      })
    });    
    this._MapService.markers.push(marker);
  }
}
