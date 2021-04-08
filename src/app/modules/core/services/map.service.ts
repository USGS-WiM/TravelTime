import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import { markerClusterGroup } from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';
import { MapLayer } from '../models/maplayer';
import { Drift } from '../models/drift';
import { gages } from '../models/gages';
import * as xml2js from 'xml2js';
import 'leaflet.markercluster';

export interface layerControl {
  baseLayers: Array<any>;
  overlays: Array<any>
}

@Injectable()
export class MapService {

  public Options: L.MapOptions;
  // for layers that will show up in the leaflet control
  public LayersControl: BehaviorSubject<layerControl> = new BehaviorSubject<any>({ baseLayers: [], overlays: [] });

  public _layersControl: layerControl = {
    baseLayers: [], overlays: []
  };
  public CurrentZoomLevel: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public nominalZoomLevel: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public CurrentLayer: String;
  public isClickable: boolean = false;
  public Cursor: String;
  public markerOptions;
  public fitBounds: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public _bound;
  public unitsOptions;
  public abbrevOptions;
  public http: HttpClient;
  public map: L.Map;
  public scale: L.Control.Scale;
  public ScaleOptions: L.Control.ScaleOptions;
  public gageDischargeSearch: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public layerGroup: BehaviorSubject<L.FeatureGroup> = new BehaviorSubject<L.FeatureGroup>(undefined);
  public reportlayerGroup: BehaviorSubject<L.FeatureGroup> = new BehaviorSubject<L.FeatureGroup>(undefined);
  public bounds: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);


  constructor(http: HttpClient) {

    this.http = http;

    this.Options = {
      zoom: 4,
      center: L.latLng(39, -100)
    };
    
    if(this.unitsOptions == 'metric') {
      this.ScaleOptions = {
        metric: true,
        imperial: false
      };
    } else {
      this.ScaleOptions = {
        imperial: true,
        metric: false
      }
    }

    //this.CurrentZoomLevel.next(this.Options.zoom);

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
      this.abbrevOptions = conf.Abbreviations;
      //this.addDrift();
      this.addLeafletG();
    });

  }


  public addLeafletG() {
    this.http.get('assets/data/mydatas.geojson').subscribe((data: any) => {
      var markers = markerClusterGroup();

      var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };


      var geoJsonLayer = L.geoJSON(data, {

        pointToLayer: function (feature, latlng) {
          switch (feature.properties.Condition) {
            case 'Injection': return L.circleMarker(latlng, geojsonMarkerOptions);
            case 'Reach': return L.circleMarker(latlng);
          }
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.RiverName + ' ' + feature.properties.Condition + ' - '+ feature.properties.Study);
        }
      });
      markers.addLayer(geoJsonLayer);
      this.AddMapLayer({ name: 'DRIFTgson', layer: markers, visible: false })
    })
  }


  public readDriftJson() {
    this.http.get('assets/data/driftdbV2.json').subscribe((data: any) => {
      console.log(data);
    }) 
  }

  public AddMapLayer(mlayer: MapLayer) {

    var ml = this._layersControl.overlays.find((l: any) => (l.name === mlayer.name));

    if (ml != null) ml.layer = mlayer.layer;

    else this._layersControl.overlays.push(mlayer);

    //Notify subscribers
    this.LayersControl.next(this._layersControl);
  }

  public HighlightFeature(layername: string, indx: number) {    
    var ml = this._layersControl.overlays.find((l: any) => (l.name === layername))
    if (!ml) return;
    if (!ml.visible) { ml.visible = true; }

    var j = 0;//counts only lines;
    ml.layer.eachLayer(o => {    
      if (typeof (o._layers) === "undefined") {
      } else if (o.options.radius > 50) {
      } else {
        var nhdplusid = Object.values(o._layers)[0]["feature"].properties.nhdplus_comid;
        if (Number(indx) == Number(nhdplusid)) {
          let polybounds = (Object.values(o._layers)[0]["_bounds"]);
          this.map.fitBounds(polybounds, {
            paddingTopLeft: [0, 0],
            paddingBottomRight: [100, 0]
          });
          o.setStyle({ color: "#FF3333" , weight: 5, opacity: 1 }) //highlight specific one
        } else {
          o.setStyle({
            "color": "#2C26DE",
            "weight": 3,
            "opacity": 0.60
          })
        }
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
    this.bounds.next(loc);
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

  public states = [];
  private States = new Subject<any>();
  states$ = this.States.asObservable()

  findState(latlng: any) {
    while (this.states.length > 0) {
      this.states.splice(0, this.states.length);
    }
    this.http.get("assets/data/states.json").subscribe(data => {
      var conf: any = data;
      conf.States.forEach(bbox => {
        if (latlng.lng > bbox.xmin && latlng.lng < bbox.xmax && latlng.lat > bbox.ymin && latlng.lat < bbox.ymax) {
          this.states.push(bbox.STUSPS);
        }
      });
      this.States.next(this.states);
    });
  }

  public latlng: L.LatLng;
  public LatLng = new BehaviorSubject<L.LatLng>(undefined);
  Poi$ = this.LatLng.asObservable();
  SetPoi(latlng: L.LatLng) {
    this.latlng = latlng;
    this.LatLng.next(this.latlng);
  }


  public isInsideWaterBody: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public scaleLookup(mapZoom: number) {
    switch (mapZoom) {
        case 19: return '1,128'
        case 18: return '2,256'
        case 17: return '4,513'
        case 16: return '9,027'
        case 15: return '18,055'
        case 14: return '36,111'
        case 13: return '72,223'
        case 12: return '144,447'
        case 11: return '288,895'
        case 10: return '577,790'
        case 9: return '1,155,581'
        case 8: return '2,311,162'
        case 7: return '4,622,324'
        case 6: return '9,244,649'
        case 5: return '18,489,298'
        case 4: return '36,978,596'
        case 3: return '73,957,193'
        case 2: return '147,914,387'
        case 1: return '295,828,775'
        case 0: return '591,657,550'
    }
  }
}
