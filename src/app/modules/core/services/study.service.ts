import { Injectable } from '@angular/core';
import { Study } from '../models/study';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
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
    private messager: ToastrService;
    private _workflow: workflowControl = { 
        reachedZoom: false, 
        hasMethod: false, 
        hasPOI: false, 
        hasReaches: false, 
        hasDischarge: false, 
        totResults: false, 
        onInit: true
    };

    constructor(toastr: ToastrService) {
        this.messager = toastr;

        this.WorkFlowControl.next(this._workflow);
    }

    public get checkingDelineatedPoint(): boolean {
        return (this._workflow.hasPOI && !this._workflow.hasReaches);
    }

    public SetWorkFlow(step, tf){
        this._workflow[step] = tf;
        this.WorkFlowControl.next(this._workflow);
    }

    public GetWorkFlow(step) {
        return this._workflow[step];
    }

    public ResetWorkFlow() {
        for(var i in this._workflow) {
           this._workflow[i] = false;
        }
        this.WorkFlowControl.next(this._workflow);
    }
}
