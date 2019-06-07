import { Injectable } from '@angular/core';

import { site } from '../site';
import { latLng, tileLayer, Layer } from 'leaflet';
import {POINT} from '../reach';
import * as L from "leaflet";
import { myfunctions } from '../shared/myfunctions'; 
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MapService extends myfunctions {
  public result;

  public myPoint;
  public layersControl;
  public streamLine: Layer[] = [];
  public streamArray = [];

  public gagesUpstreamArray = [];
  public gagesDownstreamArray = [];


  constructor() {
    super()
  }

  //get upstream data from the marker
  getUpstream (data) {
    while (this.gagesUpstreamArray.length != 0) {
      this.gagesUpstreamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) { //first one is the user selected site
      var gagesUpstream = this.deepCopy(data['features'][i]);
      this.gagesUpstreamArray.push(gagesUpstream);
    }
    function onEachFeature(feature, layer) {
      // does this feature have a property named 'name, comid,uri, source'?
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.comid + " " + feature.properties.name + " " + feature.properties.uri + " " + feature.properties.source);
      }
    };
    var gagesUpstream = L.geoJSON(this.gagesUpstreamArray, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })

        });
      }
    });
    return (gagesUpstream);
  };

  //get downstream data from the marker
  getDownstream (data) {
    while (this.gagesDownstreamArray.length != 0) {
      this.gagesDownstreamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) { //first one is the user selected site
      if (data['features'][i].geometry['type'] == 'Point') { //if type of point, add marker
        var gagesDownstream = this.deepCopy(data['features'][i]);
        this.gagesDownstreamArray.push(gagesDownstream);
      }
    }
    function onEachFeature(feature, layer) {
      // does this feature have a property named 'name, comid,uri, source'?
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.comid + " " + feature.properties.name + " " + feature.properties.uri + " " + feature.properties.source);
      }
    };
    var gagesDownstream = L.geoJSON(this.gagesDownstreamArray, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })

        });
      }
    });
    return (gagesDownstream);
  };

  //add polyline downstream
  addPolyLine(data) {
    var myStyle = {
      "color": "#FF3333",
      "weight": 3,
      "opacity": 0.60
    }

    while (this.streamArray.length != 0) {
      this.streamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) {
      if (data['features'][i].geometry['type'] == 'LineString') { //if type of point, add marker
        var polylinePoints = this.deepCopy(data['features'][i]);
        this.streamArray.push(polylinePoints);
      }
    }
    this.streamLine = L.geoJSON(this.streamArray,{style:myStyle});
    return (this.streamLine);
  }

}
