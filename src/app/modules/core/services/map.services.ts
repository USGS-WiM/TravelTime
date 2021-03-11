import { Injectable, ElementRef, EventEmitter, Injector } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { MapLayer } from '../models/maplayer';
import { Drift } from '../models/drift';
import { gages } from '../models/gages';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../shared/messageType';
import * as xml2js from 'xml2js';

export interface layerControl {
  baseLayers: Array<any>;
  overlays: Array<any>
}

@Injectable()
export class MapService {

  public Options: L.MapOptions;
  // for layers that will show up in the leaflet control
  public LayersControl: BehaviorSubject<layerControl> = new BehaviorSubject<any>({ baseLayers: [], overlays: [] });
  public gagesarray: Array<gages> = [];
  public newSessionGages: Array<gages> = [];

  public _layersControl: layerControl = {
    baseLayers: [], overlays: []
  };
  public CurrentZoomLevel: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
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
  public gageDischargeSearch: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  private messanger: ToastrService;
  public layerGroup: BehaviorSubject<L.FeatureGroup> = new BehaviorSubject<L.FeatureGroup>(undefined);
  public reportlayerGroup: BehaviorSubject<L.FeatureGroup> = new BehaviorSubject<L.FeatureGroup>(undefined);
  public bounds: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public showGages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(http: HttpClient, toastr: ToastrService) {

    this.messanger = toastr;

    this.http = http;

    this.Options = {
      zoom: 4,
      center: L.latLng(39, -100)
    };
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
      this.addDrift();
    });

  }


  public addDrift() {

    this.http.get('assets/data/table.csv', { responseType: 'text' }).subscribe(data => {
      let csvToRowArray = data.split("\n");
      var driftLayer = L.layerGroup();
      var blackPin = L.divIcon({ className: 'wmm-pin wmm-black wmm-icon-circle wmm-icon-white wmm-size-10' });
      var myRenderer = L.canvas({ padding: 0.5 });
      for (let index = 1; index < csvToRowArray.length - 1; index++) {
        let row = csvToRowArray[index].split(",");
        var markerPoint = new Drift(row[0], row[1], row[2].trim())
        var newMarker = new L.Marker(L.latLng(parseFloat(markerPoint['lat']), parseFloat(markerPoint['lon'])), {
          icon: blackPin
        });
        newMarker.addTo(driftLayer);
      }
      this.AddMapLayer({ name: 'DRIFT', layer: driftLayer, visible: false });
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

  public gages = [];
  private StreamGages = new Subject<any>();
  gages$ = this.StreamGages.asObservable();

  getGageInfoNwis(site: any)  {
    let baseurl = "https://waterdata.usgs.gov/nwis/inventory?search_site_no=" + site + "&search_site_no_match_type=exact&group_key=NONE&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=lat_va&column_name=long_va&column_name=dec_lat_va&column_name=dec_long_va&column_name=coord_meth_cd&column_name=coord_acy_cd&column_name=coord_datum_cd&column_name=dec_coord_datum_cd&column_name=district_cd&column_name=state_cd&column_name=county_cd&column_name=country_cd&column_name=land_net_ds&column_name=map_nm&column_name=map_scale_fc&column_name=alt_va&column_name=alt_meth_cd&column_name=alt_acy_va&column_name=alt_datum_cd&column_name=huc_cd&column_name=basin_cd&column_name=topo_cd&column_name=data_types_cd&column_name=instruments_cd&column_name=construction_dt&column_name=inventory_dt&column_name=drain_area_va&column_name=contrib_drain_area_va&column_name=tz_cd&column_name=local_time_fg&column_name=reliability_cd&column_name=gw_file_cd&column_name=nat_aqfr_cd&column_name=aqfr_cd&column_name=aqfr_type_cd&column_name=well_depth_va&column_name=hole_depth_va&column_name=depth_src_cd&column_name=project_no&column_name=rt_bol&column_name=peak_begin_date&column_name=peak_end_date&column_name=peak_count_nu&column_name=qw_begin_date&column_name=qw_end_date&column_name=qw_count_nu&column_name=gw_begin_date&column_name=gw_end_date&column_name=gw_count_nu&column_name=sv_begin_date&column_name=sv_end_date&column_name=sv_count_nu&list_of_search_criteria=search_site_no";
    return (this.http.get<any>(baseurl, <Object>{ responseType: 'text' }));
  }

  getGageInfoNwisv2(site: any) {
    let baseurl = "https://waterservices.usgs.gov/nwis/site/?site=" + site + "&siteoutput=expanded";
    return (this.http.get<any>(baseurl, <Object>{ responseType: 'text' }));
  }

  getRealTimeFlow(starttime: string,endtime: string, site: any) {
    this.gages = []; //clear array
    for (var i = 0; i < site.length; i++) {
      let startdate = starttime;
      let enddate = endtime;
      let gage = site[i];
      let siteid = (gage.identifier.replace("USGS-", ""));
      let baseurl = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=" + siteid + "&startDT=" + startdate + "&endDT=" + enddate + "&parameterCd=00060&siteStatus=active";
      this.http.get<any>(baseurl).subscribe(result => {
        this.gages.push(result);
      });
    }
    this.StreamGages.next(this.gages);
  }


  public csvJSON(csv) {
    var lines = csv.split(" ");

    var result = [];

    var headers = lines[0].split(" ");

    for (var i = 1; i < lines.length; i++) {

      var obj = {};
      var currentline = lines[i].split(" ");

      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
  }


  getMostRecentFlow(site: any) {
    this.gages = [];
    for (var i = 0; i < site.length; i++) {
      let gage = site[i];
      let siteid = (gage.properties.identifier.replace("USGS-", ""));
      let baseurl = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=" + siteid + "&parameterCd=00060&siteStatus=active";
      this.http.get<any>(baseurl).subscribe(result => {
        this.gages.push(result);
        this.getGageInfoNwisv2(siteid).subscribe(Nwisresult => {
          const csv = [];
          const lines = Nwisresult.split('#');
          lines.forEach(element => {
            const cols: string[] = element.split(';');
            csv.push(cols);
          });
          let myresult = csv[csv.length - 1][0];
          let jsonresult = JSON.stringify(myresult);
          let myarrayv1 = jsonresult.split('\\n');
          let myarrayv2 = [];
          myarrayv1.forEach(item => {
            let temparray = item.split('\\t');
            myarrayv2.push(temparray);
          })
          let params = myarrayv2[1];
          let time = myarrayv2[2];
          let value = myarrayv2[3];
          let len = params.length;
          let data = []
          for (let x = 0; x < len; x++) {
            let element = {
              [params[x].toString()]: value[x],
              "time": time[x]
            };
            data.push(element);
          }
          let mydata = JSON.stringify(data);
          let parsedJson = JSON.parse(mydata);
          //let contribda = parsedJson[30].contrib_drain_area_va;
          //let da = parsedJson[29].drain_area_va;
          parsedJson.forEach(item => {
            let contribda = 0;
            let da = 0;
            if (item.hasOwnProperty('contrib_drain_area_va') | item.hasOwnProperty('drain_area_va')) {
               if (item.contrib_drain_area_va > 0) {
                contribda = item.contrib_drain_area_va
              } else if (item.drain_area_va > 0) {
                da = item.drain_area_va
              } else {}

              if (contribda > 0) {
                  this.updateGageData(result, gage, contribda);
                } else if (da > 0) {
                  this.updateGageData(result, gage, da);
                } else {
                  this.http.get<any>("https://test.streamstats.usgs.gov/gagestatsservices/stations/" + siteid).subscribe(SSresult => {
                    let SSd = SSresult.characteristics[0].value;
                    this.updateGageData(result, gage, SSd); //failed
                  })
                }
              }
          })
          this.showGages.next(true);
        });

        /*const p: xml2js.Parser = new xml2js.Parser();
        this.getGageInfoNwis(siteid).subscribe(nwisresult => {
          p.parseString(nwisresult, (err, jsonresult) => {
            if (err) {
              throw err;
            } //contributing drainage area first, next drain area va

            const json = JSON.stringify(jsonresult); //format your json output
            let d = JSON.parse(json);//update gage info to match from nwis
            this.updateGageData(result, gage, d.usgs_nwis.site[0].drain_area_va[0]);
          });
        });*/


        if ("USGS-" + siteid == site[site.length-1].identifier) {

        }
      })
    }

    this.gagesArray.next(this.gagessub);
    this.StreamGages.next(this.gages);
  }

  public gagessub = [];
  public updateGageData(result, site, F) {
    let newgage = site.properties;
    if (F > 0) {
      newgage.drainagearea = F;
    }
    if (result.value.timeSeries.length > 0) {
      let code = "USGS-" + result.value.timeSeries[0].sourceInfo.siteCode[0].value;
      if (newgage.identifier == code) {
        console.log('matched and updated discharge values');
        newgage.value = result.value.timeSeries[0].values[0].value[0].value;
        let date = new Date(result.value.timeSeries[0].values[0].value[0].dateTime);
        newgage.record = date;
      } else {
        
      }
    } else {
      this.sm('Gage is missing discharge value: ' + site.properties.identifier + "More info on: " + site.properties.uri);
    }
    this.gagessub.push(newgage);
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      this.messanger.show(msg, title, options, mType);
    } catch (e) {
    }
  }

  public gagesArray: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>(undefined);
  public isInsideWaterBody: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}
