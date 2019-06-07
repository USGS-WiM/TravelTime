import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import { GetNavigationService } from '../services/get-navigation.service';
import { MapService } from '../services/map.service';
import {site, parameters} from '../site';
import {myfunctions} from '../shared/myfunctions';
import { Observable, of } from 'rxjs';

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent extends myfunctions implements OnInit {

  constructor(
    private _GetNavigationService: GetNavigationService,
    private _MapService: MapService,
  ) { super () }

  ngOnInit() {
    this._GetNavigationService.getRequiredConfig()
    .toPromise().then(data => {
      this.Site_reference = data['configuration'];
    }); //get service {description: Initial description}
  }

  layersControl = {
    baseLayers: {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        zIndex: 1,
        attribution:
        'Imagery from <a href="https://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>' +
        '&mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }),

      'Topo': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        zIndex: 1,
        attribution:
          'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL,' +
          'Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      }),

      'TexasHydro': L.tileLayer(
        "https://txgeo.usgs.gov/arcgis/rest/services/Mapping/HydroBaseMapForTerrain/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 11,
          minZoom: 5,
          attribution: 'Texas Streamer Esri product'
        }
      )
    }
  }

  // Values to bind to Leaflet Directive
	options = {
		layers: [ this.layersControl.baseLayers.Topo],
		zoom: 10,
		center: L.latLng(39.6, -75.7)
  };
  

  userselect_markers: L.Marker [] = [];
  sitesupstream_markers: L.Marker [] = [];
  sitesdownstream_markers: L.Marker [] = [];
  downstream_polyline: L.Layer [] = [];
  layers: L.Layer [] = [];

  Site_reference: site;
  results = [];
  sites_upstream = [];
  sites_downstream = [];
  fitBounds: any = null;

  marker_sites = [];


  addMarker(e) {
    let mySite = new site ([this.Site_reference]);
    if (this.userselect_markers.length>0){
      while (this.userselect_markers.length != 0) {
        this.userselect_markers.splice(0, 1)
      }
    }
    const marker = new L.marker([e.latlng.lat, e.latlng.lng], {
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
        iconSize: [25, 35],
        iconAnchor: [30 / 2, 35]
      })
    }).on('click',this.swapElement(mySite['mylist'], 2, 3));
    this.userselect_markers.push(marker);
    this.marker_sites.push(mySite);
  }

  getUpstream (){
    let mySite = this.marker_sites[this.marker_sites.length-1];
    let markerup = this.userselect_markers[0];
    let e = markerup.getLatLng();
    this.onMarkerClick(mySite['mylist'], e.lat, e.lng, 'upstream', ['gage'], 100);
  }

  getDownstream(){
    let mySite = this.marker_sites[this.marker_sites.length-1];
    let markerdw = this.userselect_markers[0];
    let e = markerdw.getLatLng();
    this.onMarkerClick(mySite['mylist'], e.lat, e.lng, 'downstream', ['gage', 'flowline'], 100);
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
        let myreturn;
        let polyline;
        if (cond == 'upstream') {
          myreturn = this._MapService.getUpstream(data);
        } else {
          myreturn = this._MapService.getDownstream(data);
          polyline = this._MapService.addPolyLine(data);
          this.userselect_markers.push(polyline);
        }
        this.userselect_markers.push(myreturn);
      }
    );

  }
}
