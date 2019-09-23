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

  public CurrentZoomLevel;
  public myurl;
  public options: L.MapOptions;
  public layersControl: layerControl = { baseLayers: {}, overlays: {} };
  //public layersControl: any; //
  public map: L.Map; //reference to the object
  
  constructor(public http: HttpClient) {
    this.options = {
      layers: [
      ],
      zoom: 10,
      center: L.latLng(46.95, -122)
    };
  }

  public onMapReady(map) {
    this.map = map; //reference to the map
    this.http.get("../../../.././assets/config.json").subscribe(data => {
      var conf: any = data;      //load baselayers

      //add basemaps
      conf.mapLayers.baseLayers.forEach(ml => {
        if (ml.visible) {
          if (ml.type === "agsbase") { //esri layers special case
              this.layersControl.baseLayers[ml.name] = esri.basemapLayer(ml.layer);
          } else {
            this.layersControl.baseLayers[ml.name] = this.loadBaselayer(ml);
          }
        }
      });

      //add overlays
      conf.mapLayers.overlays.forEach(ml => {
        if (ml.visible) {
          if (ml.type === "agsDynamic") {//esri layers special case
            ml.layerOptions['url'] = ml.url;
            this.layersControl.overlays[ml.name] = esri.dynamicMapLayer(ml.layerOptions)
          } else {
              this.layersControl.overlays[ml.name] = this.loadOverlaylayer(ml);
          }
        }
      });
      this.CurrentZoomLevel = 8;
    });
  }
  
  private loadBaselayer(ml): L.Layer { //baselayers method
    var layer: L.Layer = null;
    switch (ml.type) {
      case 'agsbase':
        layer = esri.basemapLayer(ml.layer); //ml.layer = NationalGeographic
      case 'tile':
        layer = L.tileLayer(ml.url, ml.layerOptions);
    }//end switch
    if (this.options.layers.length > 0) { } else {
      layer.addTo(this.map);
    }
    return layer;
  }

  private loadOverlaylayer(ml): L.Layer { //overlays method
    var layer: L.Layer = null;
    switch (ml.type) {
      case 'overlay':
        layer = L.tileLayer(ml.url, ml.layerOptions)//, ml.layerOptions
    } //end switch
    return layer;
  }

  public interactwOverlayer(LayerName: string) {

    if (this.map.hasLayer(this.layersControl.overlays[LayerName])) {
      this.map.removeLayer(this.layersControl.overlays[LayerName]);
    }
    else {
      this.map.addLayer(this.layersControl.overlays[LayerName]);
    }
  }

  public interactwBaselayer(LayerName: string) {

    if (this.map.hasLayer(this.layersControl.baseLayers[LayerName])) {
      this.map.removeLayer(this.layersControl.baseLayers[LayerName]);
    }
    else {
      this.map.addLayer(this.layersControl.baseLayers[LayerName]);
    }
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
