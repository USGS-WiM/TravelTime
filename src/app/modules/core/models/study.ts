import { LatLng } from 'leaflet'
import { Observable, of, Subject } from 'rxjs';

export class Study {
    public LocationOfInterest: LatLng;
    public Reaches: Array<any> = [];
    public SpillMass: number;
    public Discharge: number;
    public SpillDate: string;
    public RecoveryRatio: number;
    private _methodType : string;
    public get MethodType() : string {
      return this._methodType;
    }

    public spillPlanningResponse: any;
    
    public Results: Array<any>;

    public constructor(methodtype: string) { 
      this._methodType = methodtype;
    }
}
