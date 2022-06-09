import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import { markerClusterGroup } from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';
import { MapLayer } from '../models/maplayer';
import { gages } from '../models/gages';
import * as xml2js from 'xml2js';
import 'leaflet.markercluster';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { StudyService } from '../services/study.service';
import * as messageType from '../../../shared/messageType';
import { Study } from '../models/study';
import { Drift } from '../models/drift';
import { ChartService } from './chart.service';

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
  private messanger: ToastrService;
  private StudyService: StudyService;
  public layerGroup: BehaviorSubject<L.FeatureGroup> = new BehaviorSubject<L.FeatureGroup>(undefined);
  public reportlayerGroup: BehaviorSubject<L.FeatureGroup> = new BehaviorSubject<L.FeatureGroup>(undefined);
  public bounds: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public showGages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showUpstream: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(http: HttpClient, toastr: ToastrService, studyService: StudyService) {

    this.messanger = toastr;
    this.StudyService = studyService;

    this.http = http;

    this.Options = {
      zoom: 4,
      center: L.latLng(39, -100),
      maxZoom: 16
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

  //DISPLAY FOOTER AND CHARTS;

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
    //this.addDriftGroup(); //add back in after DRIFT data becomes available
    });
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
            paddingTopLeft: [100, 100],
            paddingBottomRight: [100, 100],
            maxZoom: 14
          });
          //record current style
          o.options2 = o.options;
          o.setStyle({ color: "#BD00FF" , weight: 6, opacity: 1 }) //highlight specific one #FF3333
        } else {
          if (o.options2) {
            o.setStyle(o.options2);
          } else {
          var style = o.options;
          o.setStyle({ style })  
          }    
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
    this.CurrentLayer = ml.name;
    var tempOptions = this.Options;
    this.LayersControl.next(this._layersControl);
    this.CurrentZoomLevel.next(tempOptions.zoom);
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

  public getFlowLineLayerGroup(features, method, isMetric, mostMax) {
    const layerGroup = new L.FeatureGroup([]);
    const reportlayerGroup = new L.FeatureGroup([]);
    var nhdcomid;
        var rtDischarge;
        var maDischarge;
        var length; //accumulated distance
        var drainage;
        var velocity;
        //var peak_tot;  //for testing only
        var accutot;
        var accutotmax;
        var velocityMax;
        var temppoint;

    let gagesArray = [];
    features.forEach(i => {
      if (i.geometry.type === 'Point') {
        var siteID = i.properties.identifier.replace("USGS-", "");
		// MarkerMaker Icon
      var blackTriangle = L.divIcon({className: 'wmm-triangle wmm-black wmm-size-15'});
          layerGroup.addLayer(L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { 
        icon: blackTriangle
      }).bindPopup('<h3>Streamgages</h3><br /><b>Station ID: </b>' + siteID + '<br /><b>Station Name: </b>' + i.properties.name + '<br /><b>Station Latitude: </b>' + i.geometry.coordinates[1] + '<br /><b>Station Longitude: </b>' + i.geometry.coordinates[0] + '<br /><b>NWIS page: </b><a href="' + i.properties.uri + '" target="_blank">link</a><br /><b>StreamStats Gage page: </b><a href="https://streamstatsags.cr.usgs.gov/gagepages/html/' + siteID + '.htm" target="_blank">link</a>'));
          reportlayerGroup.addLayer(L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { 
        icon: blackTriangle
      }));
          gagesArray.push(i);
        } else if (typeof i.properties.nhdplus_comid === 'undefined') {
          layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline_dash));
          reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline_dash));        
        } else {
          if(this.StudyService.selectedStudy.MethodType === 'planning') { //colorize spill planning trace
            if (mostMax === 'most') {          
              if (i.properties.IsWaterBody === 1 || isNaN(i.properties.accutot)) {
                layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline_break));     //gray
                reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline_break));
              } else if (i.properties.accutot > 0 && i.properties.accutot <= 6) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2dash));        //red, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2));        //red
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2));
                }
              } else if (i.properties.accutot > 6 && i.properties.accutot <= 12) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3dash));        //red orange, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3));        //red orange
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3));
                }
              } else if (i.properties.accutot > 12 && i.properties.accutot <= 24) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4dash));        //orange, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4));        //orange
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4));
                }
              } else if (i.properties.accutot > 24 && i.properties.accutot <= 36) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5dash));        //yellow, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5));        //yellow
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5));
                }
              }  else if (i.properties.accutot > 36 && i.properties.accutot <= 48) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6dash));        //lime green, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6));        //lime green
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6));
                }
              } else {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7dash));        //dark green, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7));    //dark green
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7));
                }
              }
            } else if (mostMax === 'max') {
              if (i.properties.IsWaterBody === 1 || isNaN(i.properties.accutot)) {
                layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline_break));     //gray
                reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline_break));
              } else if (i.properties.accutotmax > 0 && i.properties.accutotmax <= 6) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2dash));        //red, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2));        //red
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline2));
                }
              } else if (i.properties.accutotmax > 6 && i.properties.accutotmax <= 12) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3dash));        //red orange, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3));        //red orange
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline3));
                }
              } else if (i.properties.accutotmax > 12 && i.properties.accutotmax <= 24) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4dash));        //orange, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4));        //orange
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline4));
                }
              } else if (i.properties.accutotmax > 24 && i.properties.accutotmax <= 36) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5dash));        //yellow, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5));        //yellow
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline5));
                }
              } else if (i.properties.accutotmax > 36 && i.properties.accutotmax <= 48) {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6dash));        //lime green, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6));        //lime green
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline6));
                }
              } else {
                if (i.properties.CanalDitch > 50 || i.properties.Connector > 50) {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7dash));        //dark green, dashed
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7dash));
                } else {
                  layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7));    //dark green
                  reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7));
                }
              }
            }
          } else { //spill response trace
            layerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7));    //dark green
            reportlayerGroup.addLayer(L.geoJSON(i, this.markerOptions.Polyline7));
          }

          //reach pop-up text assignments
          if(this.StudyService.selectedStudy.MethodType === 'response') {
            nhdcomid = 'Reach ID: ' + String(i.properties.nhdplus_comid);
            if(this.StudyService.GetWorkFlow('totResults')) { //travel times have been calculated
              if(isMetric) {            
                maDischarge = 'Mean annual discharge: ' + String((i.properties.Discharge * 0.0283).toUSGSvalue());  //cfs to cms
                //remember to grab accumulated length
                length = 'Length: ' + String((i.properties.Length * 1).toUSGSvalue());  //kilometers (single reach)
                drainage = ' Drainage area: ' + String(i.properties.DrainageArea);  //square kilometers
                temppoint = i.geometry.coordinates[i.geometry.coordinates.length - 1];
                //items below to be hooked up later - items above come from selectedStudy.SpillResponseResponse, items below come from selectedStudy.Results
                //velocity = 'Velocity (most probable): ' + String(i.properties.VelocityMost);    
                //velocityMax = 'Velocity (max probable): ' + String(i.properties.VelocityMax);
                //accutot = 'Travel time (most probable): ' + String(i.properties.accutot);
                //accutotmax = 'Travel time (max probable): ' + String(i.properties.accutotmax);            
              } else { //imperial units
                maDischarge = 'Mean annual discharge: ' + String(i.properties.Discharge); // cfs
                length = 'Length: ' + String((i.properties.Length * 0.6214).toUSGSvalue()); //miles (single reach)
                drainage = ' Drainage area: ' + String(Math.round((i.properties.DrainageArea * 0.386102) * 10) / 10);  //square miles
                temppoint = i.geometry.coordinates[i.geometry.coordinates.length - 1];
                //items below to be hooked up later - items above come from selectedStudy.SpillResponseResponse, items below come from selectedStudy.Results
                // velocity = 'Velocity (most probable): ' + String(i.properties.VelocityMost);
                // velocityMax = 'Velocity (max probable): ' + String(i.properties.VelocityMax);
                // accutot = 'Travel time (most probable): ' + String(i.properties.accutot);
                // accutotmax = 'Travel time (max probable): ' + String(i.properties.accutotmax);            
              }
            } else { //have not yet calculated travel times
              if(isMetric) {            
                maDischarge = 'Mean annual discharge: ' + String((i.properties.Discharge * 0.0283).toUSGSvalue());  //cfs to cms
                length = 'Length: ' + String((i.properties.Length * 1).toUSGSvalue());  //kilometers (single reach)
                drainage = ' Drainage area: ' + String(i.properties.DrainageArea);  //square kilometers
                temppoint = i.geometry.coordinates[i.geometry.coordinates.length - 1];           
              } else { //imperial units
                maDischarge = 'Mean annual discharge: ' + String(i.properties.Discharge); // cfs
                length = 'Length: ' + String((i.properties.Length * 0.6214).toUSGSvalue()); //miles (single reach)
                drainage = ' Drainage area: ' + String(Math.round((i.properties.DrainageArea * 0.386102) * 10) / 10);  //square miles
                temppoint = i.geometry.coordinates[i.geometry.coordinates.length - 1];            
              }
            }
            
          } else { //methodType = planning
            nhdcomid = 'Reach ID: ' + String(i.properties.nhdplus_comid);
            rtDischarge = 'Real-time discharge: ' + String(i.properties.RTDischarge);
            maDischarge = 'Mean annual discharge: ' + String(i.properties.Discharge);
            length = 'Length: ' + String(i.properties.acculength);
            drainage = ' Drainage area: ' + String(i.properties.DrainageArea);
            velocity = 'Velocity (most probable): ' + String(i.properties.VelocityMost);
            velocityMax = 'Velocity (max probable): ' + String(i.properties.VelocityMax);
            //peak_tot = 'Peak ToT for reach only: ' + String(i.properties.T_p); for testing only
            accutot = 'Travel time (most probable): ' + String(i.properties.accutot);
            accutotmax = 'Travel time (max probable): ' + String(i.properties.accutotmax);
            temppoint = i.geometry.coordinates[i.geometry.coordinates.length - 1];
          }

          //reach end node assignments
          if(method === 'response'){
            if(isMetric) {
              if(mostMax === "most") {
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + ' km<br />' + maDischarge + ' cms'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + 'km<br />' + rtDischarge + ' cms<br />' + maDischarge + ' cms'));
              } else { //max probable scenario
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + ' km<br />' + maDischarge + ' cms'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + 'km<br />' + rtDischarge + ' cms<br />' + maDischarge + ' cms'));
              }              
            } else { //imperial units
              if(mostMax === "most") {
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + ' mi<br />' + maDischarge + ' cfs'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + 'mi<br />' + rtDischarge + ' cfs<br />' + maDischarge + ' cfs'));
              } else {  //max probable scenario
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + ' mi<br />' + maDischarge + ' cfs'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + 'mi<br />' + rtDischarge + ' cfs'));
              }            
            }
          } else { //planning
            if(isMetric) {
              if(mostMax === "most") {
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + ' km<br />' + rtDischarge + ' cms<br />' + maDischarge + ' cms<br />' + velocity + ' m/s<br />' + accutot + ' hrs'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + ' km<br />' + rtDischarge + ' cms<br />' + maDischarge + ' cms<br />' + velocity + ' m/s<br />' + accutot + 'hrs'));
              } else {  //max probable scenario
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + ' km<br />' + rtDischarge + ' cms<br />' + maDischarge + ' cms<br />' + velocityMax + ' m/s<br />' + accutotmax + ' hrs'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' km<sup>2</sup><br />' + length + ' km<br />' + rtDischarge + ' cms<br />' + maDischarge + ' cms<br />' + velocityMax + ' m/s<br />' + accutotmax + 'hrs'));
              }
            } else {
              if(mostMax === "most") {
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + ' mi<br />' + rtDischarge + ' cfs<br />' + maDischarge + ' cfs<br />' + velocity + ' f/s<br />' + accutot + ' hrs'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + ' mi<br />' + rtDischarge + ' cfs<br />' + maDischarge + ' cfs<br />' + velocity + ' f/s<br />' + accutot + ' hrs'));
              } else { //max probable scenario
                layerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + ' mi<br />' + rtDischarge + ' cfs<br />' + maDischarge + ' cfs<br />' + velocityMax + ' f/s<br />' + accutotmax + ' hrs'));
                reportlayerGroup.addLayer(L.circle([temppoint[1], temppoint[0]], this.markerOptions.EndNode).bindPopup(nhdcomid + '<br />' + drainage + ' mi<sup>2</sup><br />' + length + ' mi<br />' + rtDischarge + ' cfs<br />' + maDischarge + ' cfs<br />' + velocityMax + ' f/s<br />' + accutotmax + ' hrs'));
              }
            }
          }
          this.layerGroup.next(layerGroup);
          this.reportlayerGroup.next(reportlayerGroup);
        }
      })

    // because it is async it takes time to process function above, once we have it done - we get the bounds
    // Potential to improve
    setTimeout(() => {
      this.setBounds(layerGroup.getBounds());
    });
  }
  
  public addDriftGroup() {
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
      this.AddMapLayer({ name: 'DRIFT endpoints', layer: markers, visible: false })
      //var geoObject = JSON.parse(data);
      this.StudyService.DriftData = data.features;//geoObject;
    })
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
  GetPOI() {
    return this.latlng;
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
