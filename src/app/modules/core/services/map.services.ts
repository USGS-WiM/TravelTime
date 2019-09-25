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
  public map: L.Map; //reference to the object
  public baselayernames = [];
  public overlaynames = [];
  public selection = []; // selected baselayer


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
        this.baselayernames.push(ml.name);

        if (ml.visible && (this.selection.length < 1)) { //on init
          this.selection.push(ml.name)
        } else if (ml.visible) { //otherwise, if layer suppose to be visible, grab it and set as default
          this.selection.pop();
          this.selection.push(ml.name);
        }

        if (ml.type === "agsbase") { //esri layers special case
          var layer = esri.basemapLayer(ml.layer);
          this.layersControl.baseLayers[ml.name] = layer;
          this.loadOption(layer, ml);
        } else {
          this.layersControl.baseLayers[ml.name] = this.loadBaselayer(ml);
        }
      });

      //add overlays
      conf.mapLayers.overlays.forEach(ml => {
        this.overlaynames.push(ml.name);
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

  private loadOption(layer: any, ml) {
    if (this.options.layers.length > 0 && (ml.name != this.selection[0])) { //if the basemap already exist, but a new one is different from the basemap, set a new one as default
      this.options.layers.pop();
      this.options.layers.push(layer);
    } else { //otherwise, on init, just push all the layers to the map, and if there is one that is visible, with a matching name of selected default, set it as basemap
      layer.addTo(this.map);
      if (ml.visible)// && (ml.name == this.selection[0])) {
      { this.options.layers.push(layer); }
    }
  }

  private loadBaselayer(ml): L.Layer { //baselayers method
    var layer: L.Layer = null;
    switch (ml.type) {
      case 'tile':
        layer = L.tileLayer(ml.url, ml.layerOptions);
    }//end switch
    this.loadOption(layer, ml);
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
    if (LayerName === this.selection[0]) {
    } else {
      this.map.removeLayer(this.layersControl.baseLayers[this.selection[0]]);
      this.selection[0] = LayerName;
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
