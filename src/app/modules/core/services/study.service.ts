import { Injectable } from '@angular/core';
import { Study } from '../models/study';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
import { reach } from '../models/reach';
import { deepCopy } from '../../../shared/extensions/object.DeepCopy';

export interface UnitsArray { name: string, isactive: boolean, units: string };

export interface workflowControl {
    reachedZoom: boolean;
    hasMethod: boolean;
    hasPOI: boolean;
    hasError: boolean;
    hasReaches: boolean;
    hasDischarge: boolean;
    totResults: boolean;
    onInit: boolean;
  }
 
@Injectable()
export class StudyService extends deepCopy   {

  //HOLDS DISCHARGE, MASS, TIME, AND RECOVERY RATIO
  public selectedStudy: Study;
  public DriftData: Array<any>;
  private SelectedReturn = new Subject<Study>();
  study$ = this.SelectedReturn.asObservable();  
  //SET MASS
  public setConcentration(mass) {
      this.selectedStudy.SpillMass = mass;
      this.SelectedReturn.next(this.selectedStudy);
  }
  //SET DISCHARGE
  public setDischarge(discharge) {
    this.selectedStudy.Discharge = discharge;
    this.SelectedReturn.next(this.selectedStudy);
  }
  //SET RECOVERY RATIO
  public setRecoveryRatio(recoveryRatio) {
    this.selectedStudy.RecoveryRatio = recoveryRatio;
    this.SelectedReturn.next(this.selectedStudy);
  }
  //SET TIME
  public setDate(datestring) {
    this.selectedStudy.SpillDate = datestring;
    this.SelectedReturn.next(this.selectedStudy);
  }

  private selectedMethod = new Subject<number>();
  methodType$ = this.selectedMethod.asObservable();

  public WorkFlowControl: Subject<workflowControl> = new Subject<any>();
  public ReportOptions: Array<any>;
  public distance: number;
  private messager: ToastrService;

  private ResultReturn = new Subject<boolean>();
  return$ = this.ResultReturn.asObservable();

  public defDischarge = "cubic meters per second";
  public defConcentration = "kilograms";
  public defRecoveryRatio = "dimensionless"

  private selectedProcedure = new Subject<number>();
  procedureType$ = this.selectedProcedure.asObservable();

  public unitS = {
    "metric": {
      "discharge": "cubic meters per second",
      "drainageArea": "square meters",
      "distance": "meters",
      "concentration": "kilograms",
      "slope": "meters/meters"
    },
    "imperial": {
      "discharge": "cubic feet per second",
      "drainageArea": "square miles",
      "distance": "miles",
      "concentration": "pounds",
      "slope": "feet/feet"
    }
  };
  public abbrev = {
    "metric": {
      "discharge": "cms",
      "drainageArea": "m^2",
      "distance": "m",
      "concentration": "kg",
      "slope": "m/m"
    },
    "imperial": {
      "discharge": "cfs",
      "drainageArea": "mi^2",
      "distance": "mi",
      "concentration": "lbs",
      "slope": "ft/ft"
    }
  }
  private UnitsReturn = new Subject<string>();
  units$ = this.UnitsReturn.asObservable();

  private _workflow: workflowControl = { reachedZoom: false, hasMethod: false, hasPOI: false, hasError: false, hasReaches: false, hasDischarge: false, totResults: false, onInit: true };

  public units: UnitsArray[] = [
    { name: "metric", isactive: true, units: "kilometers" },
    { name: "imperial", isactive: false, units: "miles" }
  ];

  public setUnits(unit: string) {
    this.defDischarge = this.unitS[unit].discharge;
    this.defConcentration = this.unitS[unit].concentration;
  }

  public isMetric(): boolean {
    let tf;
    this.units.forEach(j => {
      if (j.isactive) {
        if (j.name === 'imperial') {
          tf = false;
        }
        else tf = true;
      } else {}
    })
    return tf;
  }

  public get checkingDelineatedPoint(): boolean {
      return (this._workflow.hasPOI && !this._workflow.hasReaches);
  }

  public SetWorkFlow(step, tf){
      this._workflow[step] = tf;
      this.WorkFlowControl.next(this._workflow);
  }

  public noticeAction(action: boolean) {
    this.ResultReturn.next(action);
  }

  public GetWorkFlow(step) {
    if (this._workflow["totResults"]) {

      this.noticeAction(true);
    }
      return this._workflow[step];
  }

  public setProcedure(indx: number) {
      this.selectedProcedure.next(indx);
  }

  public ResetWorkFlow() {
      for(let i in this._workflow) {
          this._workflow[i] = false;
      }
      this.WorkFlowControl.next(this._workflow);
  }

  public formatReaches(data): any {
    const streamArray = [];
    for (let i = 0; i < data.features.length; i++) {
      if (data.features[i].geometry.type === 'LineString') {
        const polylinePoints = this.deepCopy(data.features[i]);
        streamArray.push(polylinePoints);
      }
    }
    streamArray.map((reach) => {
      reach.properties.show = false;
    });

    if(this.selectedStudy.MethodType == "response") { // response method sorts table by drainage area, smallest to largest
      if(this.selectedStudy.RDP.length > 1) {
        streamArray.shift(); //removes overland trace
      }
      const sortArray = streamArray.sort( (a, b) => {
        return a.properties.DrainageArea - b.properties.DrainageArea;
      });
      return (sortArray);
    } else { //planning method sorts table by total travel time, largest to smallest
      streamArray.shift(); //removes overland trace
      const sortArray = streamArray.sort( (a, b) => {
        return b.properties.accutot - a.properties.accutot;
      });
      return (sortArray);
    }
  }

  constructor(toastr: ToastrService) {
    super();
    this.messager = toastr;
    this.WorkFlowControl.next(this._workflow);
    this.distance = 100;
    this.UnitsReturn.next('metric');
    this.selectedProcedure.next(1);
  }
}
