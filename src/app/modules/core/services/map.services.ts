import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapLayer } from '../models/maplayer';


export interface layerControl {
  baseLayers: Array<any>;
  overlays: Array<any>
}
@Injectable()
export class MapService {

  public Options: L.MapOptions;
  // for layers that will show up in the leaflet control
  public LayersControl: Subject<layerControl> = new Subject<any>();
  private _layersControl: layerControl = { baseLayers: [], overlays: [] };
  public CurrentZoomLevel;
  public CurrentLayer: String;
  public isClickable: boolean = false;
  public Cursor: String;
  public markerOptions;
  public fitBounds: Subject<any> = new Subject<any>();
  public _bound;


  constructor(http: HttpClient) {

    this.Options = {
      zoom: 4,
      center: L.latLng(39, -100)
    };

    http.get("assets/data/config.json").subscribe(data => {
      //load baselayers
      var conf: any = data;

      conf.mapLayers.baseLayers.forEach(ml => {
        if (ml.visible)
          this.CurrentLayer = ml.name;
        else {}
        ml.layer = this.loadLayer(ml);
        if (ml.layer != null)
          this._layersControl.baseLayers.push(ml);
      });

      conf.mapLayers.overlayLayers.forEach(ml => {
        ml.layer = this.loadLayer(ml);
        if (ml.layer != null)
          this._layersControl.overlays.push(ml);
      });
      this.LayersControl.next(this._layersControl);

      this.markerOptions = conf.mapLayers.markerOptions;

    });

    this.CurrentZoomLevel = this.Options.zoom;
  }

  public AddMapLayer(mlayer: MapLayer) {
    var ml = this._layersControl.overlays.find((l: any) => (l.name === mlayer.name));
    if (ml != null) ml.layer = mlayer.layer;
    else this._layersControl.overlays.push(mlayer);

    //Notify subscribers
    this.LayersControl.next(this._layersControl);
  }

  public SetOverlay (layername: string) {

    var ml = this._layersControl.overlays.find((l: any) => (l.name === layername))

    if (!ml) return;

    if (ml.visible) { ml.visible = false; }
    else {
      ml.visible = true;
    }
      //notify layercontrol change
    this.LayersControl.next(this._layersControl);
  }

  public SetBaselayer(layername: string) {

    if (this.CurrentLayer != layername) {
      var ml = this._layersControl.baseLayers.find((l: any) => (l.name === this.CurrentLayer))
      if (!ml) return; 
      ml.visible = false;
    }

    var ml = this._layersControl.baseLayers.find((l: any) => (l.name === layername))

    if (ml.visible) { ml.visible = false; }
    else {
      ml.visible = true;
    }
    this.CurrentLayer = ml.name
    this.LayersControl.next(this._layersControl);
  }

  public setCursor() {
    //this.cursor = cursortype;
  }

  public setBounds(loc) {
    this._bound = loc;
    this.fitBounds.next(this._bound);
  }

  private loadLayer(ml): L.Layer {
    try {
      switch (ml.type) {
        case 'agsbase':
          return esri.basemapLayer(ml.layer);
        case 'tile':
          //https://leafletjs.com/reference-1.5.0.html#tilelayer
          return L.tileLayer(ml.url, ml.layerOptions);
        case 'agsDynamic':
          //https://esri.github.io/esri-leaflet/api-reference/layers/dynamic-map-layer.html
          var options = ml.layerOptions;
          options.url = ml.url;
          return esri.dynamicMapLayer(options);
        case 'agsTile':
          var options = ml.layerOptions;
          options.url = ml.url;
          return esri.tiledMapLayer(options);
        default:
          console.warn("No condition exists for maplayers of type ", ml.type, "see config maplayer for: " + ml.name)
      }//end switch
    } catch (error) {
      console.error(ml.name + " failed to load mapllayer", error)
      return null;
    }
  }
}
