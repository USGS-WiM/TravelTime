import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaderResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { gages } from '../models/gages';
import { MapService } from '../services/map.service'
import * as messageType from '../../../shared/messageType';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as L from 'leaflet';

@Injectable()
export class NWISService {
  public get baseURL() {return "https://waterservices.usgs.gov/nwis";}
  public gages = [];
  public gagesArray: BehaviorSubject<Array<gages>> = new BehaviorSubject<Array<gages>>(undefined);
  private MapService: MapService;
  private StreamGages = new Subject<any>();
  public showGages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private messanger: ToastrService;

  constructor(private http: HttpClient, mapservice: MapService, toastr: ToastrService) {
    this.MapService = mapservice;
    this.messanger = toastr;
  }

  //gages$ = this.StreamGages.asObservable();

  getGageInfoNwis(site: any) {
    let baseurl = "https://waterdata.usgs.gov/nwis/inventory?search_site_no=" + site + "&search_site_no_match_type=exact&group_key=NONE&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=lat_va&column_name=long_va&column_name=dec_lat_va&column_name=dec_long_va&column_name=coord_meth_cd&column_name=coord_acy_cd&column_name=coord_datum_cd&column_name=dec_coord_datum_cd&column_name=district_cd&column_name=state_cd&column_name=county_cd&column_name=country_cd&column_name=land_net_ds&column_name=map_nm&column_name=map_scale_fc&column_name=alt_va&column_name=alt_meth_cd&column_name=alt_acy_va&column_name=alt_datum_cd&column_name=huc_cd&column_name=basin_cd&column_name=topo_cd&column_name=data_types_cd&column_name=instruments_cd&column_name=construction_dt&column_name=inventory_dt&column_name=drain_area_va&column_name=contrib_drain_area_va&column_name=tz_cd&column_name=local_time_fg&column_name=reliability_cd&column_name=gw_file_cd&column_name=nat_aqfr_cd&column_name=aqfr_cd&column_name=aqfr_type_cd&column_name=well_depth_va&column_name=hole_depth_va&column_name=depth_src_cd&column_name=project_no&column_name=rt_bol&column_name=peak_begin_date&column_name=peak_end_date&column_name=peak_count_nu&column_name=qw_begin_date&column_name=qw_end_date&column_name=qw_count_nu&column_name=gw_begin_date&column_name=gw_end_date&column_name=gw_count_nu&column_name=sv_begin_date&column_name=sv_end_date&column_name=sv_count_nu&list_of_search_criteria=search_site_no";
    return (this.http.get<any>(baseurl, <Object>{ responseType: 'text' }));
  }

  getGageInfoNwisv2(site: any) {
    let baseurl = "https://waterservices.usgs.gov/nwis/site/?site=" + site + "&siteoutput=expanded";
    return (this.http.get<any>(baseurl, <Object>{ responseType: 'text' }));
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      this.messanger.show(msg, title, options, mType);
    } catch (e) {
    }
  }


  getRealTimeFlow(starttime: any, site: any) {

    //console.log("get real time called");
    this.gages = []; //clear array

    var month = starttime.month;
    var day = starttime.day;
    var hour = starttime.hour;
    var min = starttime.minute;


    if (hour < 10) {hour = "0" + hour}
    if (month < 10) { month = "0" + month }
    if (min < 10) { min = "0" + min }
    if (day < 10) {day = "0" + day}
       
    var dischargetime = starttime.year + "-" + month + "-" + day + "T" + hour + ":" + min + "%2b0500&endDT=";
    var enddisttime;
    if (Number(hour) > 19) {
      hour = 4 + (hour - 24);
      if (hour < 10) { hour = "0" + hour }
      enddisttime = starttime.year + "-" + month + "-" + day + "T" + hour + ":" + min + + "%2b0500&";
    } else if (Number(hour) < 10) {
      hour = Number(hour) + 4;
      if (hour < 10) {hour = "0" + hour}
      enddisttime = starttime.year + "-" + month + "-" + day + "T" + hour + ":" + min + "%2b0500&";
    } else {
      enddisttime = starttime.year + "-" + month + "-" + day + "T" + (Number(hour) + 4) + ":" + min + "%2b0500&";
    }

    
    for (var i = 0; i < site.length; i++) {
      let gage = site[i];
      let siteid = (gage.identifier.replace("USGS-", ""));
      //let refid = "05587450"
      let baseurl = "https://nwis.waterservices.usgs.gov/nwis/iv/?format=json&sites=" + siteid + "&startDT=" + dischargetime + enddisttime + "&parameterCd=00060&siteStatus=all";
      this.http.get<any>(baseurl).subscribe(result => {
        if ((result.value.timeSeries.length) > 0) {
          this.updateDischarge(result);
          this.gages.push(result);
        }
      });
    }

    this.StreamGages.next(this.gages);
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
              } else { }

              if (contribda > 0) {
                this.updateGageData(result, gage, contribda);
              } else if (da > 0) {
                this.updateGageData(result, gage, da);
              } else {
                this.http.get<any>("https://test.streamstats.usgs.gov/gagestatsservices/stations/" + siteid).subscribe(SSresult => {
                  try {
                    //check for drainage area (filter)
                    let SSd = 0;
                    if (SSresult.hasOwnProperty('characteristics')) {
                      SSd = this.filterDA(SSresult.characteristics);
                    }
                    this.updateGageData(result, gage, SSd);
                  } catch {
                    console.error('All methods failed to get drainage area for selected site, using drainage area from nldi nearest reach: ' + siteid)
                    this.updateGageData(result, gage, 0);
                  } //failed
                }, (error) => {
                  console.error('All methods failed to get drainage area for selected site, using drainage area from nldi nearest reach: ' + siteid)
                  this.updateGageData(result, gage, 0);
                })
              }
            }
          })
          // if ("USGS-" + siteid == site[site.length - 1].identifier) {
          //   this.updateGageData(result, gage);
          //   this.MapService.showGages.next(true);
          // }
        });
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
        //console.log('matched and updated discharge values');
        newgage.value = result.value.timeSeries[0].values[0].value[0].value;
        let date = new Date(result.value.timeSeries[0].values[0].value[0].dateTime);
        newgage.record = date;
      } 
    } else {
      this.sm('Gage is missing discharge value: ' + site.properties.identifier + "More info on: " + site.properties.uri);
    }
    this.gagessub.push(newgage);
  }


  public updateDischarge(gage) {
    this.gagessub.forEach(g => {
      let code = "USGS-" + gage.value.timeSeries[0].sourceInfo.siteCode[0].value;
      if (g.identifier == code) {
        //console.log("matched identifiers code");
        g.value = gage.value.timeSeries[0].values[0].value[0].value;
        g.record = new Date(gage.value.timeSeries[0].values[0].value[0].dateTime);
        //console.log(g.value)
        //console.log(g.identifier)
        //console.log(g.record)
      }

    })
    console.log("updated gages array")
    this.gagesArray.next(this.gagessub);
  }


  //checks to see if site is inactive
  public getStatus(siteid:string) {
    let url = this.baseURL + "/site/?site=" + siteid + "&siteStatus=inactive";

    console.log(siteid);
    return this.http.get<any>(url)
    .pipe(
      catchError(err => {
      if (err.status === 404) {
        return of(false);
      }}
      ))
  }

  public filterDA(data) {
    let contribda = 0;
    let da = 0;
    data.forEach(element => {
      if (element.variableType.code == 'CONTDA') {
        contribda = element.value;
      } else if (element.variableType.code == 'DRNAREA') {
        da = element.value;
      }
    })
    if (contribda > da) {
      return (contribda);
    } else {
      return (da);
    }
  }

  public check4gages(features) {
    const layerGroup = new L.FeatureGroup([]);
    const reportlayerGroup = new L.FeatureGroup([]);
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
      } 
    })

    //check if there is a gage data;
    if (gagesArray.length > 0) {
      for (var i = 0; i < gagesArray.length; i++) {
        features.forEach(o => {
          if (o.geometry.type !== "Point") {
            if (gagesArray[i].properties.comid == String(o.properties.nhdplus_comid)) {
              gagesArray[i].properties["drainagearea"] = o.properties.DrainageArea / 2.59; //in sqmiles
            } else { }
          }
        })
      };
      //create service
      //add gage
      this.gagesArray.next(gagesArray);
      this.MapService.gageDischargeSearch.next(true);
      this.getMostRecentFlow(gagesArray);
    } else {
      this.MapService.gageDischargeSearch.next(true);
    };

    // because it is async it takes time to process function above, once we have it done - we get the bounds
    // Potential to improve
    setTimeout(() => {
      this.MapService.setBounds(layerGroup.getBounds());
    });
  }
}
