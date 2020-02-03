import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../shared/messageType'

@Injectable({
  providedIn: 'root'
})
export class KrigservicesService {
  private messager: ToastrService;

  public get baseURL() { return "https://test.streamstats.usgs.gov/krigservices"; }

  //evnt.latlng

  public getNearestMostCorrelatedStations(latlng: any, state: any): Observable<any> {
    let url = this.baseURL + "/sites/" + state + "/krig?x=" + latlng.lng + "&y=" + latlng.lat + "&crs=4326"
    console.log(url);
    return this.http.get<any>(url)
      .pipe(catchError(this.handleError('getNearestMostCorrelatedStations', [])));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.sm("Please try again.", messageType.ERROR, "Http Error Occured!", 0);
      return of(result as T)
    }
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) options = { timeOut: timeout };

      this.messager.show(msg, title, options, mType)
    }
    catch (e) {
    }
  }

  constructor(private http: HttpClient, toastr: ToastrService) {
    this.messager = toastr;
  }
}
