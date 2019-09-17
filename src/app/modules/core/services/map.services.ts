import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';
export interface layerControl{
  baseLayers:any;
  overlays:any
}
@Injectable()
export class MapService {

  // for layers that will show up in the leaflet control
  //public layersControl: layerControl = { baseLayers: {}, overlays: {} };
    //any; //
  public CurrentZoomLevel;
  public myurl;
  public layers;
  public options: L.MapOptions;
  public layersControl: layerControl = { baseLayers: {}, overlays: {} };

  constructor(public http: HttpClient) {
    this.options = {
      layers: [],//L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")],
      zoom: 10,
      center: L.latLng(46.95, -122)
    };
  }

  public onMapReady(map) {
    this.http.get("../../../.././assets/config.json").subscribe(data => {
      //load baselayers
      var conf: any = data;

      conf.mapLayers.baseLayers.forEach(ml => {
        this.layersControl.baseLayers[ml.name] = this.loadLayer(ml, map);
      });

      conf.mapLayers.overlays.forEach(ml => {
        this.layersControl.overlays[ml.name] = this.loadLayer(ml, map);
      });

      this.CurrentZoomLevel = 8;
    });
  }
  
  private loadLayer(ml, map):L.Layer{
    var layer:L.Layer = null;
    switch (ml.type) {
      case 'agsbase':
        layer = esri.basemapLayer(ml.layer).addTo(map);
      case 'tile':
        layer = L.tileLayer(ml.url, ml.layerOptions);
      case 'overlay':
        layer = L.tileLayer(ml.url, ml.layerOptions).addTo(map);
      case 'agsDynamic':
        layer = esri.dynamicMapLayer({
          url: ml.url,
          zIndex: 1,
          format: "png8",
          layers: [0],
          f: "image"
        }).addTo(map);

    }//end switch
    if (ml.visible && layer != null) {
      this.options.layers.splice(0, 1);
      this.options.layers.push(layer);
    }
    return layer;
  }

 /*  public addFeatureLayer(esriurl) {
    const features = esri.featureLayer({
      url: esriurl,
      pointToLayer: function (geojson, latlng) {
        return new L.CircleMarker(latlng, {
          color: 'green',
          radius: 1
        });
      },
      onEachFeature: function (feature, layer) {
        // layer.bindPopup( fl => {
        //   const popupEl: NgElement & WithProperties<PopupComponent> = document.createElement('popup-element') as any;
        //   // Listen to the close event
        //   popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));
        //   popupEl.message = `${feature.properties.areaname}, ${feature.properties.st}`;
        //   // Add to the DOM
        //   document.body.appendChild(popupEl);
        //   return popupEl;
        // });
      }
    });

    return features;
  } */

  public changeCursor(cursorType) {
    //L.DomUtil.addClass(._container,'crosshair-cursor-enabled');
  }
}
