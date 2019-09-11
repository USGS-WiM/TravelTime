import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';

@Injectable()
export class MapService {

  public options: L.MapOptions;
  // for layers that will show up in the leaflet control
  public layersControl: any;
  // for layers not shown in the leaflet control
  public ActiveLayers: Array<any> = [];

  public CurrentZoomLevel = undefined;

  constructor() {
    this.options = {     
      zoom: 4,
      center: L.latLng(40, -100),
      //cursor: 
    };
    this.CurrentZoomLevel = this.options.zoom;

    this.layersControl = {
      baseLayers: {        
        'National Geographic': esri.basemapLayer('NationalGeographic'),
        'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
        'Streets': esri.basemapLayer('Streets'),
        'Topographic': esri.basemapLayer('Topographic')
      },
      //You can add any kind of Leaflet layer you want to the overlays map. This includes markers, shapes, geojson, custom layers from other libraries, etc.
      overlays: { 
        'State Cities': this.addFeatureLayer(),       
        'Big Circle': L.circle([ 46.95, -122 ], { radius: 5000 }),
        'Big Square': L.polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
      }
    };

    this.ActiveLayers.push(this.layersControl['baseLayers']['National Geographic']);
    this.ActiveLayers.push(this.layersControl['overlays']['State Cities']);
    this.ActiveLayers.push(this.layersControl['overlays']['Big Circle']);
    this.ActiveLayers.push(this.layersControl['overlays']['Big Square']);    
  }

  public addFeatureLayer() {
    const features = esri.featureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0',
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