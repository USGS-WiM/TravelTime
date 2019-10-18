import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../shared/messageType'
import { reach } from '../models/reach';

@Injectable()
export class TravelTimeService {
public get baseURL() {return "https://test.streamstats.usgs.gov/timeoftravelservices/";}
private messager:ToastrService;
  constructor(private http: HttpClient,toastr: ToastrService) {
    this.messager = toastr;
   }

  public getJobsonConfigurationObject(): Observable <any>{
    let url = this.baseURL+"jobsons";
    return this.http.get<any>(url)
        .pipe(catchError(this.handleError('getJobsonConfigurationObject',[])));
  }
  public ExecuteJobson(massconcentration:Number, starttime, reaches): Observable <any>{
    let url = this.baseURL+"jobsons?initialmassconcentration="+massconcentration+"&starttime="+starttime;

    // I'm thinking this should occure before here (in a validation method or something)
    
    let reachdictionary = {};
    for (let index = 0; index < reaches.length; index++) {
      reachdictionary[index] = reaches[index];      
    }

    return this.http.post<reach>(url, {reaches: reachdictionary})
        .pipe(catchError(this.handleError('Execute',[])));
  }
  
  private handleError<T>(operation ='operation', result?:T){
    return (error:any):Observable<T> => {
      console.error(error);
      this.sm("Please try again.", messageType.ERROR, "Http Error Occured!",0);
      return of(result as T)
    }
  }
  private sm(msg: string, mType:string = messageType.INFO,title?:string,timeout?:number) {
    try {
      let options:Partial<IndividualConfig> = null;
      if(timeout) options ={timeOut:timeout};

      this.messager.show(msg,title,options, mType)
    }
    catch (e) {
    }
  }
}
