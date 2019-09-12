import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MapService {

  public options: L.MapOptions;
  // for layers that will show up in the leaflet control
  public layersControl: any;
  public CurrentZoomLevel;
  public config;
  public esriurl;
  public layers;
  public layerid: string;
  public layermethod: any;
  public layername: string;

  constructor(public http: HttpClient) {

    this.options = {
      layers: [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {})
      ],
      zoom: 10,
      center: L.latLng(46.95, -122)
    };

    this.http.get("../../../.././assets/config.json").subscribe(data => {
      this.config = data;
      this.customLayers();

      this.layersControl = {
        baseLayers: {
          'National Geographic': esri.basemapLayer('NationalGeographic'),
          'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
          'Streets': esri.basemapLayer('Streets'),
          'Topographic': esri.basemapLayer('Topographic')
        },
        //You can add any kind of Leaflet layer you want to the overlays map. This includes markers, shapes, geojson, custom layers from other libraries, etc.
        overlays: {
          'State Cities': this.addFeatureLayer(this.config.EsriFeatureLayer),
          'Big Circle': L.circle([46.95, -122], { radius: 5000 }),
          'Big Square': L.polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]])
        }
      };
    });

    this.CurrentZoomLevel = this.options.zoom;
  }

  public customLayers() {
    switch (this.layername) {
      case 'National Geographic' || 'Streets' || 'Topographic':
        this.layermethod = esri.basemapLayer;
        this.layerid = this.layername.replace(/\s/g, "");
        this.layermethod(this.layerid);
        break;
      case 'Open Street Map':
        this.layermethod = L.tileLayer;
        //this.layerid = this.config.
        break;
      //default: console.log ("Missing tile " + this.customlayer);
      //throw new Exception("Illegal Operation" + operator);
    }
  }

  public addFeatureLayer(esriurl) {
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
  }

  public changeCursor(cursorType) {
    //L.DomUtil.addClass(._container,'crosshair-cursor-enabled');
  }
}
