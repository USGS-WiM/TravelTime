import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaderResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
//import { gages } from '../models/gages';
import { MapService } from '../services/map.service'

@Injectable()
export class NWISService {
  public get baseURL() {return "https://waterservices.usgs.gov/nwis";}
  public gages = [];
  public gagesArray: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>(undefined);
  private MapService: MapService;
  private StreamGages = new Subject<any>();

  constructor(private http: HttpClient, mapservice: MapService) {
    this.MapService = mapservice;
  }

  gages$ = this.StreamGages.asObservable();

  getRealTimeFlow(starttime: string,endtime: string, site: any) {
    this.gages = []; //clear array
    for (var i = 0; i < site.length; i++) {
      let startdate = starttime;
      let enddate = endtime;
      let gage = site[i];
      let siteid = (gage.identifier.replace("USGS-", ""));
      let baseurl = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=" + siteid + "&startDT=" + startdate + "&endDT=" + enddate + "&parameterCd=00060&siteStatus=active";
      console.log(baseurl);
      this.http.get<any>(baseurl).subscribe(result => {
        this.gages.push(result);
      });
    }
    this.StreamGages.next(this.gages);
  }

  getMostRecentFlow(site: any) {
    console.log("used function getmostrecentflow");
    this.gages = [];
    var status;
    for (var i = 0; i < site.length; i++) {
      let gage = site[i];
      let siteid = (gage.properties.identifier.replace("USGS-", ""));
      //let url = "https://waterservices.usgs.gov/nwis" + siteid + "&siteStatus=inactive";
      let baseurl = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=" + siteid + "&parameterCd=00060&siteStatus=active";
      this.http.get<any>(baseurl).subscribe(result => {
        this.gages.push(result);
        this.updateGageData(result, gage);
        console.log(site);
        console.log("USGS-" + siteid);
        this.MapService.showGages.next(true);
        if ("USGS-" + siteid == site[site.length-1].identifier) {

        }
      })
    }

    this.gagesArray.next(this.gagessub);
    this.StreamGages.next(this.gages);
  }

  public gagessub = [];
  public async updateGageData(result, site) {
    let newgage = site.properties;
    let siteid = site.properties.identifier.replace("USGS-", "");
    if (result.value.timeSeries.length > 0) {
      let code = "USGS-" + result.value.timeSeries[0].sourceInfo.siteCode[0].value;
      console.log(code);
      if (newgage.identifier == code) {
        console.log('matched and updated discharge values');
        newgage.value = result.value.timeSeries[0].values[0].value[0].value;
        let date = new Date(result.value.timeSeries[0].values[0].value[0].dateTime);
        newgage.record = date;
      } else {
        
      }
    } else {
      //this.sm('Gage is missing discharge value: ' + site.properties.identifier + "More info on: " + site.properties.uri);
    }    
    //newgage.status = await this.checkStatus(siteid);
    this.gagessub.push(newgage);
  }
  
  //checks to see if site is inactive
  public getStatus(siteid:string) {
    let url = this.baseURL + "/site/?site=" + siteid + "&siteStatus=inactive";

    return this.http.get<any>(url)
    .pipe(
      catchError(err => {
      if (err.status === 404) {
        return of(false);
      }}
      ))
  }
}
