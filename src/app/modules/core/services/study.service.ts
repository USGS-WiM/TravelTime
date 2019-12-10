import { Injectable } from '@angular/core';
import { Study } from '../models/study';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
import { reach } from '../models/reach';

export interface UnitsArray { name: string, isactive: boolean };

export interface workflowControl {
    reachedZoom: boolean;
    hasMethod: boolean;
    hasPOI: boolean;
    hasReaches: boolean;
    hasDischarge: boolean;
    totResults: boolean;
    onInit: boolean;
  }
 
@Injectable()
export class StudyService  {
    public selectedStudy: Study;
    public WorkFlowControl: Subject<workflowControl> = new Subject<any>();
    public ReportOptions: Array<any>;
    public distance: number;
    private messager: ToastrService;
    private ResultReturn = new Subject<boolean>();
    return$ = this.ResultReturn.asObservable();
    public defDischarge = "cubic meters per second";
    public defConcentration = "kilograms";

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
        "drainageArea": "square feet",
        "distance": "feet",
        "concentration": "pounds",
        "slope": "feet/feet"
      }
    };
    private UnitsReturn = new Subject<string>();
    units$ = this.UnitsReturn.asObservable();


    private _workflow: workflowControl = { reachedZoom: false, hasMethod: false, hasPOI: false, hasReaches: false, hasDischarge: false, totResults: false, onInit: true };

    public units: UnitsArray[] = [
      { name: "metric", isactive: true },
      { name: "imperial", isactive: false }
    ];

    constructor(toastr: ToastrService) {
        this.messager = toastr;
        this.WorkFlowControl.next(this._workflow);
        this.distance = 10;
        this.UnitsReturn.next('metric');
        this.selectedProcedure.next(1);
    }

    public setUnits(unit: string) {
      this.defDischarge = this.unitS[unit].discharge;
      this.defConcentration = this.unitS[unit].concentration;
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
        for(var i in this._workflow) {
           this._workflow[i] = false;
        }
        this.WorkFlowControl.next(this._workflow);
    }
}
