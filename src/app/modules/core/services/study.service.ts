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
    public distance: number;
    private messager: ToastrService;
    private ResultReturn = new Subject<boolean>();
    return$ = this.ResultReturn.asObservable();
    public WorkFlowControl: Subject<workflowControl> = new Subject<any>();
    private _workflow: workflowControl = { reachedZoom: false, hasMethod: false, hasPOI: false, hasReaches: false, hasDischarge: false, totResults: false, onInit: true };

    public units: UnitsArray[] = [
      { name: "metric", isactive: true },
      { name: "imperial", isactive: false }
    ];

    constructor(toastr: ToastrService) {
        this.messager = toastr;
        this.WorkFlowControl.next(this._workflow);
        this.distance = 10;
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
}
