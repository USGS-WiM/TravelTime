import { Injectable } from '@angular/core';

import { site } from '../site';
import { latLng, tileLayer, Layer } from 'leaflet';
import {POINT} from '../reach';
import * as L from "leaflet";
import { myfunctions } from '../shared/myfunctions'; 


@Injectable({
  providedIn: 'root'
})

export class MapService extends myfunctions {
  public result = [];
  public mySite: site;
  public mymap: L.Map;
  public markers: Layer[] = [];
  public sites: Layer[] = [];
  public myPoint;
  public layersControl;
  public streamLine: Layer[] = [];
  public streamArray = [];

  public gagesUpstream: Layer[] = [];
  public gagesDownstream: Layer[] = [];

  public gagesUpstreamArray = [];
  public gagesDownstreamArray = [];


  constructor() {
    super()

    this.mymap = {
      layers: [
        tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20, attribution: '...' })
      ],
      zoom: 5,
      center: latLng(39.6, -75.7)
    };

    this.layersControl = {
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
        
        'CartoDB': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          zIndex: 1,
          attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; ' +
                  '<a href="https://cartodb.com/attributions">CartoDB</a>'
        }),
  
        'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          zIndex: 1,
          attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, ' +
                  'and the GIS User Community'
            // maxZoom: 10
        }),
  
        'Terrain': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
          zIndex: 1,
          attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
          maxZoom: 13
        }),
  
        'Gray': L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
              zIndex: 1,
              attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
              maxZoom: 16
          }
        ),
        'TexasHydro': L.tileLayer(
          "https://txgeo.usgs.gov/arcgis/rest/services/Mapping/HydroBaseMapForTerrain/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 11,
            minZoom: 5,
            attribution: 'Texas Streamer Esri product'
          }
        )
        
      },
      overlays: {
  
      }
    }
  }

  getUpstream(data) {
    for (var i = 1; i < data['features'].length; i++) { //first one is the user selected site
      var gagesUpstream = this.deepCopy(data['features'][i]);
      this.gagesUpstreamArray.push(gagesUpstream);
    }

    function onEachFeature(feature, layer) {
      // does this feature have a property named 'name, comid,uri, source'?
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.comid + " "+ feature.properties.name + " " + feature.properties.uri + " "+ feature.properties.source);
      }
    };

    var gagesUpstream = L.geoJSON(this.gagesUpstreamArray, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })

        });
      }
    });

    this.sites.push(gagesUpstream);
  };

  getDownstream(data) {
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
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })

        });
      }
    });

    this.sites.push(gagesDownstream);
    this.addPolyLine(data);
  };

  addPolyLine(data) {

    for (var i = 1; i < data['features'].length; i++) {
      if (data['features'][i].geometry['type'] == 'LineString') { //if type of point, add marker
        var polylinePoints = this.deepCopy(data['features'][i]);
        this.streamArray.push(polylinePoints);
      }
    }

    this.streamLine = L.geoJSON(this.streamArray);
    this.sites.push(this.streamLine);
  }

}
