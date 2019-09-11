import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../shared/messageType'

@Injectable()
export class TravelTimeService {
public get baseURL() {return "https://test.streamstats.usgs.gov/timeoftravelservices/";}
private messanger:ToastrService;
  constructor(private http: HttpClient,toastr: ToastrService) {
    this.messanger = toastr;
   }

  public getJobsonConfigurationObject(): Observable <any>{
    let url = this.baseURL+"/jobsons";
    return this.http.get<any>(url)
        .pipe(catchError(this.handleError('getJobsonConfigurationObject',[])));
  }
  public ExecuteJobson(massconcentration:string, starttime, reaches): Observable <any>{
    let url = this.baseURL+"/jobsons?initialmassconcentration="+massconcentration+"&starttime="+starttime

    // I'm thinking this should occure before here (in a validation method or something)
    
    // //deep copy of the list before call, and check for inputs
    // for (var i= 0; i<mylist.length; i++){
    //   var myreach = <reach>mylist[i];
    //   reaches[i] = myreach;

    //   //Maps the object and removes parameters that were not used
    //   reaches[i]['parameters'].map((parObj, iter) => {
    //     if (parObj['required'] == false && parObj['value'] == undefined)
    //     {
    //       reaches[i]['parameters'].splice(iter, 1);
    //     }
    //   })
    // }

    return this.http.post(url, {reaches})
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

      this.messanger.show(msg,title,options, mType)
    }
    catch (e) {
    }
  }
}
