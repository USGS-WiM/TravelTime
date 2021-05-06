import { LatLng } from 'leaflet'
import { Observable, of, Subject } from 'rxjs';

export class Study {
    public LocationOfInterest: LatLng;
    public Reaches: Array<any> = [];
    public SpillMass: number;
    public Discharge: number;
    public SpillDate: string;
    public RecoveryRatio: number;
    public spillPlanningResponse: any;
    public RDP: any; //rain drop path response    
    public Results: Array<any>;

    private _methodType : string;
    public get MethodType() : string {
      return this._methodType;
    }

    public constructor(methodtype: string) { 
      this._methodType = methodtype;
    }
}
