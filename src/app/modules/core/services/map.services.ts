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

  public options: L.MapOptions;
  // for layers that will show up in the leaflet control
  public layersControl: layerControl={baseLayers: {},overlays: {}};
  public CurrentZoomLevel;
  public esriurl;
  public layers;
  public layerid: string;
  public layermethod: any;
  public layername: string;

  constructor(http: HttpClient) {

    this.options = {
      layers: [],
      zoom: 10,
      center: L.latLng(46.95, -122)
    };

    http.get("../../../.././assets/config.json").subscribe(data => {
     
      //load baselayers
      var conf:any = data;
      conf.mapLayers.baseLayers.forEach(ml => {
        this.layersControl.baseLayers[ml.name]=this.loadLayer(ml);
      });
      /* conf.mapLayers.overlays.forEach(ml => {
        this.layersControl.overlays[ml.name]=this.loadLayer(ml);
      }); */

      this.layersControl.overlays= {          
          'Big Circle': L.circle([46.95, -122], { radius: 5000 }),
          'Big Square': L.polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]])
        }
      });
    

    this.CurrentZoomLevel = this.options.zoom;
  }

  private loadLayer(ml):L.Layer{
    var layer:L.Layer = null;
    switch (ml.type) {
      case 'agsbase':
        layer =esri.basemapLayer(ml.layer);
      case 'tile':
        //https://leafletjs.com/reference-1.5.0.html#tilelayer
        layer =L.tileLayer(ml.url, ml.layerOptions);
      case 'agsDynamic':
        //https://esri.github.io/esri-leaflet/api-reference/layers/dynamic-map-layer.html
        var options = ml.layerOptions;
        options.url = ml.url;
        layer= esri.dynamicMapLayer(options);
          
    }//end switch
    if (ml.visible && layer != null) this.options.layers.push(layer);
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
