import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import { GetNavigationService } from '../services/get-navigation.service';
import { MapService } from '../services/map.service';
import {site, parameters} from '../site';
import {myfunctions} from '../shared/myfunctions';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material';
import 'leaflet-search-control';//plugin functions
import 'leaflet-search';

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})

export class MapComponent extends myfunctions implements OnInit {

  private map: L.map;

  constructor(
    public dialog: MatDialog,
    private _GetNavigationService: GetNavigationService,
    private _MapService: MapService,
  ) { super () }

  ngOnInit() {
    this._GetNavigationService.getRequiredConfig()
    .toPromise().then(data => {
      this.Site_reference = data['configuration'];
    }); //get service {description: Initial description}
    //this.newFunc(); moving layers control to the sidebar
  }

  onMapReady(map: L.Map) {
    var search = L.control.search({
      url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
      placeholder: 'Search',
      minNumberOfCharacters: 0,
      searchOnEnter: true,
      noResults: 'No Records Found',
      jsonpParam: 'json_callback',
      propertyName: 'display_name',
      propertyLoc: ['lat', 'lon'],
      marker: L.circleMarker([0, 0], { radius: 30 }),
      autoCollapse: true,
      autoType: false,
      minLength: 2,
      container: 'findbox'
    });
    search.addTo(map);
    this.map = map;
  }

  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  handleEvent(map: L.map) {
    if (typeof this.map === 'undefined') { } else {
      if (this.map.getZoom() <= 8) {
        this.setStep(0)
      } else if (this.map.getZoom() > 8) {
        this.setStep(1)
      } else {
        this.setStep (0)
      }
    }
  }

  openDialog() {
    let dialog = this.dialog.open(ModalComponent, {
      width: '90%',
      height: '90%'
    });
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

  zoom = 5;
  center = L.latLng(40.0, -100.0);
  // Values to bind to Leaflet Directive
	options = {
      layers: [this.layersControl.baseLayers.Topo],
      zoom: this.zoom,
      center: this.center
  };

  markers: L.Layer [] = [];
  Site_reference: site;
  results = [];
  sites_upstream = [];
  sites_downstream = [];
  fitBounds: any = null;
  marker_sites = [];
  nodemarker = [];

  newFunc() {
    // Create the control and add it to the map;
    var control = L.control.layers(this.layersControl);
    var htmlObject = control.getContainer();
    var a = document.getElementById('example');
    function setParent(el, newParent) {
      newParent.appendChild(el);
    }
    setParent(htmlObject, a);
  }

  addMarker(e) {
    let mySite = new site ([this.Site_reference]);
    if (this.markers.length>0){
      while (this.markers.length != 0) {
        this.markers.splice(0, 1)
      }
    }

    const marker = new L.marker([e.latlng.lat, e.latlng.lng], {
      draggable: true,
      autoPan: true,
      icon: L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).on('click', this.swapElement(mySite['mylist'], 2, 3));
    this.markers.push(marker);
    this._MapService.myPoint = marker;
    this._MapService.result = mySite;
  }

  spinnerButtonOptions_downstream: MatProgressButtonOptions = {
    active: false,
    text: 'Trace downstream from spill location',
    spinnerSize: 18,
    raised: true,
    stroked: false,
    buttonColor: 'primary',
    spinnerColor: 'accent',
    fullWidth: false,
    disabled: false,
    mode: 'indeterminate',
  }

  spinnerButtonOptions_upstream: MatProgressButtonOptions = {
    active: false,
    text: 'Trace upstream from point of interest',
    spinnerSize: 18,
    raised: true,
    stroked: false,
    buttonColor: 'primary',
    spinnerColor: 'accent',
    fullWidth: false,
    disabled: false,
    mode: 'indeterminate',
  }

  getUpstream() {
    this.spinnerButtonOptions_upstream.active = true;
    let mySite = this._MapService.result;
    let e = this._MapService.myPoint.getLatLng();
    this.onMarkerClick(mySite['mylist'], e.lat, e.lng, 'upstream', ['gage'], 100);
  }

  getDownstream() {
    this.spinnerButtonOptions_downstream.active = true;
    let mySite = this._MapService.result;
    let e = this._MapService.myPoint.getLatLng();
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
          this.spinnerButtonOptions_upstream.active = false;
        } else {
          myreturn = this._MapService.getDownstream(data);
          var myStyle = {
            "color": "#FF3333",
            "weight": 3,
            "opacity": 0.60
          }
          this._MapService.addPolyLine(data);
          console.log(this._MapService.streamArray);
          polyline = L.geoJSON(this._MapService.streamArray, { style: myStyle });
          this.markers.push(polyline);
          this.spinnerButtonOptions_downstream.active = false;
        }
        this.markers.push(myreturn);
        this.fitBounds = L.latLngBounds(this.markers);
        var featureGroup = L.featureGroup(this.markers);
        this.fitBounds = featureGroup.getBounds();
        this.center = this.fitBounds.getCenter();
        this.zoom = 8;
        for (var i = 0; i < this._MapService.lastnode.length; i++) {
          this.markers.push(this._MapService.lastnode[i])
        }
      }
    );
  }
}
