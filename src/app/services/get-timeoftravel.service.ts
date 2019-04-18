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
    this._myurl = "https://test.streamstats.usgs.gov/timeoftravelservices/jobsons"
    return this.http.get<reach>(this._myurl);
  }

  postReach(mylist,ini_mass, ini_time):Observable <reach>{
    this._myurl = "https://test.streamstats.usgs.gov/timeoftravelservices/jobsons?initialmassconcentration="+ini_mass+"&starttime="+ini_time;
    //https://test.streamstats.usgs.gov/timeoftravelservices/jobsons?initialmassconcentration=6000&starttime=5
    var reaches ={ };
    
    //deepCopyConstructor
    function deepCopy(obj) {
      var copy;
  
      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" != typeof obj) return obj;
      
      // Handle Array
      if (obj instanceof Array) {
          copy = [];
          for (var i = 0, len = obj.length; i < len; i++) {
              copy[i] = deepCopy(obj[i]);
          }
          return copy;
      }
  
      // Handle Object
      if (obj instanceof Object) {
          copy = {};
          for (var attr in obj) {
              if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
          }
          return copy;
      }
  
      throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    //deep copy of the list before call, and check for inputs
    for (var i= 0; i<mylist.length; i++){
      var myreach = <reach>deepCopy(mylist[i]);
      reaches[i] = myreach;
      reaches[i]['parameters'].map((parObj, iter)=>{
        if (parObj['required'] == false && parObj['value'] == undefined)
        {
          reaches[i]['parameters'].splice(iter, 1);
        }
      })
    }
    
    //post a call
    this.http.post<reach> (this._myurl, {reaches}) //something with services, slope returning as undefined
    .subscribe (data => console.log (data));
    
    return this.http.post<reach>(this._myurl, {reaches});
  }

}
