import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, observable } from 'rxjs';
import {Gage} from '../Gage';

@Injectable({
  providedIn: 'root'
})
export class GetNavigationService {

  _myurl: string;
  myresult: [];
  constructor(private http: HttpClient) { }

  postGageUpstream(mylist): Observable <any>{
    this._myurl = "https://test.streamstats.usgs.gov/NavigationServices/navigation/3/Route"
    return this.http.post<any>(this._myurl, mylist);
  }
  postGageDownstream(mylist): Observable <any>{
    this._myurl = "https://test.streamstats.usgs.gov/NavigationServices/navigation/3/Route"
    return this.http.post<any>(this._myurl, mylist);
  }
}
