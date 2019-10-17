import { LatLng } from 'leaflet'
import { Observable, of, Subject } from 'rxjs';

export class Study {
    public LocationOfInterest: LatLng;
    public Reaches: Array<any> = [];
    public SpillMass: Number;
    public Discharge: Number;
    public SpillDate: String;
    
    private _methodType : string;
    public get MethodType() : string {
      return this._methodType;
    }
    
    public Results: Array<any>;

    public constructor(methodtype: string) { 
      this._methodType = methodtype;
    }
}
