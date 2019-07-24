import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetNavigationService {

  _myurl: string;
  myresult: [];
  constructor(private http: HttpClient) { }

  getRequiredConfig(): Observable <any>{
    this._myurl = "https://test.streamstats.usgs.gov/NavigationServices/navigation/3"
    return this.http.get<any>(this._myurl);
  }
  
  postGage(mylist): Observable <any>{
    this._myurl = "https://test.streamstats.usgs.gov/navigationservices/navigation/networktrace/route?properties=true"
    return this.http.post<any>(this._myurl, mylist);
  }

  getCurrentFlow(siteid, date): Observable <any> {
    this._myurl = "https://nwis.waterdata.usgs.gov/nwis/uv?cb_00060=on&cb_00065=on&format=rdb&site_no=" + siteid+"&period=&begin_date="+date+"&end_date="+date
    return (this.http.get<any>(this._myurl));
  }
}
