import { Injectable } from '@angular/core';
import {reach} from '../reach'
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GetTimeoftravelService {
  _myurl:string; //create empty private parameter and assign a link inside of the function
  //Need to bring current location as an input from the watershed into service and update the link
  constructor(private http: HttpClient) { }

  getReach():Observable <reach>{
    this._myurl = "https://test.streamstats.usgs.gov/timeoftravelservices/traveltime"
    return this.http.get<reach>(this._myurl);
  }

  postReach(mylist,ini_mass, ini_time):Observable <reach>{
    this._myurl = "https://test.streamstats.usgs.gov/timeoftravelservices/traveltime/?InitialMass_M_i_kg="+ini_mass+"&starttime="+ini_time;

    var reaches ={ };
    mylist.map ((myObj, index) => {
      reaches[index] = myObj
    }) //list into proper format for a call
    
    this.http.post<reach> (this._myurl, {reaches}) //something with services, slope returning as undefined
    .subscribe (data => console.log (data));
    
    return this.http.post<reach>(this._myurl, {reaches});
  }

}
