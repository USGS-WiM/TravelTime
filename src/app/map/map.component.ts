import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import {POINT} from '../reach';
import {GetNavigationService} from '../services/get-navigation.service';
import {Gage} from '../Gage';

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent implements OnInit {
  map;
  marker;
  result = [];
  myGage:Gage;

  constructor(    
    private _GetNavigationService: GetNavigationService
  ) { }

  loc: POINT = {
    lat: 39.63947146842234,
    lng: - 75.67854881286621 
  };

  message = 'Welcome to Test Version';

  ngOnInit() {
    //center on init with marker, when user clicks on it, send a call to the server, basin characteristic
    //consider ability to add one more marker
    this.map = new L.Map( "map", {
      minZoom : 4,
      maxZoom : 11,
      layers  : [
          L.tileLayer( "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}" ),
          L.tileLayer( "https://txgeo.usgs.gov/arcgis/rest/services/Mapping/Ocean/MapServer/tile/{z}/{y}/{x}" ),
          L.tileLayer( "https://txgeo.usgs.gov/arcgis/rest/services/Mapping/HydroBaseMapForTerrain/MapServer/tile/{z}/{y}/{x}" ),
          L.tileLayer( "https://txgeo.usgs.gov/arcgis/rest/services/Mapping/Mask/MapServer/tile/{z}/{y}/{x}", {"opacity":0.6} )
      ],
      center: new L.LatLng(39.63947146842234, - 75.67854881286621 ),
      zoom    : 5,
      attributionControl : false
    });

    this.marker = L.marker(this.map.getCenter(), {
      draggable: true,
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
        iconSize: [25, 35],
        iconAnchor: [30 / 2, 35]
      })
    }).addTo(this.map);

    this.myGage = new Gage (this.loc);
    this.map.on("click", e => this.onMapClick(e));
  }

  onMapClick(e) {
    this.loc.lng = e.latlng.lng;
    this.loc.lat = e.latlng.lat;
    this.marker.setLatLng(new L.LatLng(e.latlng.lat, e.latlng.lng))
      .bindPopup(" " + e.latlng).openPopup();
    this.map.panTo(new L.LatLng(e.latlng.lat, e.latlng.lng));
    this.map.setView(new L.LatLng(e.latlng.lat, e.latlng.lng), 11);

    this._GetNavigationService.postGageUpstream(this.myGage['mylist'][0]) // get reach
      .toPromise().then(data => {
        this.result.push(data);
      }); //get service {description: Initial description}

    this._GetNavigationService.postGageDownstream(this.myGage['mylist'][1]) // get reach
      .toPromise().then(data => {
        this.result.push(data);
      });
  }
}
