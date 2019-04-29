import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import {POINT} from '../reach';

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent implements OnInit {
  map;
  marker;

  loc: POINT = {
    lat: 43.939073023449794,
    lng: -74.5239635877534
  };

  message = 'Welcome to Test Version';

  ngOnInit() {
    //center on init with marker, when user clicks on it, send a call to the server, basin characteristic
    //consider ability to add one more marker
    this.map = new L.Map("map", {
      zoomControl: true,
      maxZoom: 22,
      minZoom: 5,
      center: new L.LatLng(43.939073023449794, -74.5239635877534),
      zoom: 8
    });

    const tileLayers = {
      "GoogleMaps": L.tileLayer(
        "https://{s}.google.com/vt/lyrs=s,h&hl=tr&x={x}&y={y}&z={z}",
        {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          maxNativeZoom: 20,
          zIndex: 0,
          maxZoom: 20
        }
      ).addTo(this.map)
    };

    L.control.layers(tileLayers, null, { collapsed: false }).addTo(this.map);

    this.marker = L.marker(this.map.getCenter(), {
      draggable: true,
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
        iconSize: [25, 35],
        iconAnchor: [30 / 2, 35]
      })
    }).addTo(this.map);
    console.log("this.marker", this.marker);
    this.map.on("click", e => this.onMapClick(e));
  }

  onMapClick(e) {
    this.loc.lng = e.latlng.lng;
    this.loc.lat = e.latlng.lat;
    console.log("this.marker", this.marker);
    this.marker.setLatLng(new L.LatLng(e.latlng.lat, e.latlng.lng))
      .bindPopup(" " + e.latlng).openPopup();
    this.map.panTo(new L.LatLng(e.latlng.lat, e.latlng.lng));
    this.map.setView(new L.LatLng(e.latlng.lat, e.latlng.lng), 18);
  }
}
