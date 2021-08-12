import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../shared/messageType'
import { reach } from '../models/reach';

@Injectable()
export class NLDIService {
  public get baseURL() { return "https://labs.waterdata.usgs.gov/api/nldi/pygeoapi/processes/";}
  private messager:ToastrService;

  constructor(private http: HttpClient,toastr: ToastrService) {
    this.messager = toastr;
   }

  public GetRainDropPath(lat, lon, dir): Observable <any>{
    let url = this.baseURL+"nldi-flowtrace/jobs";
    let post = {
      "inputs": [
        {
          "id": "lat",
          "type": "text/plain",
          "value": lat
        },
        {
          "id": "lon",
          "type": "text/plain",
          "value": lon
        },
        {
          "id": "raindroptrace",
          "type": "text/plain",
          "value": "True"
        },
        {
          "id": "direction",
          "type": "text/plain",
          "value": dir
        }
      ]
    }
    return this.http.post<any>(url, post)
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
