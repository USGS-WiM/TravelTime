import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
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
  public unitsOptions;

  private selectedProcedure = new Subject<number>();
  procedureType$ = this.selectedProcedure.asObservable();

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
      this.unitsOptions = conf.Units;

    });

    this.selectedProcedure.next(1);
    this.CurrentZoomLevel = this.Options.zoom;
  }

  public setProcedure(indx: number) {
      this.selectedProcedure.next(indx);
  }

  public AddMapLayer(mlayer: MapLayer) {

    var ml = this._layersControl.overlays.find((l: any) => (l.name === mlayer.name));

    if (ml != null) ml.layer = mlayer.layer;

    else this._layersControl.overlays.push(mlayer);

    //Notify subscribers
    this.LayersControl.next(this._layersControl);
  }


  public onZoomChangeCircle(layername: string, zoom: number) {
    var ml = this._layersControl.overlays.find((l: any) => (l.name === layername))
    if (!ml) return;
    if (!ml.visible) { ml.visible = true; }
    ml.layer.eachLayer(o => {
      if (o.options.radius > 10) {
        if (zoom > 13) {
          //o.setStyle({
            //radius: 20, color: "green",
            //fillColor: "red",
            //fillOpacity: 1
          //})
        } else {
          //o.setStyle({
            //radius: 50, color: "yellow",
            //fillColor: "orange",
            //fillOpacity: 0.5
          //})
        }
      } else {
      }
    })
  }


  public HighlightFeature(layername: string, indx: number) {
    
    var ml = this._layersControl.overlays.find((l: any) => (l.name === layername))
    if (!ml) return;
    if (!ml.visible) { ml.visible = true; }

    var j = 0;//counts only lines;
    ml.layer.eachLayer(o => {
      //what if there also a stream gage ?

      if (typeof (o._layers) === "undefined") {
      } else if (o.options.radius > 50) {
      } else if (j === indx) {
        o.setStyle({ color: "#2C26DE", weight: 5, opacity: 1 }) //highlight specific one
        j += 1;
      } else {
        o.setStyle({
          "color": "#FF3333",
          "weight": 3,
          "opacity": 0.60
        })
        j += 1; 
      }
    });
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

  public setCursor(type) {
    switch (type) {
      case "crosshair":
          document.getElementById('leaflet').style.cursor = 'crosshair';
          break;
      case "":
          document.getElementById('leaflet').style.cursor = '';
          break;
      default:
        break;
    }    
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
