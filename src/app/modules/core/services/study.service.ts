import { Injectable } from '@angular/core';
import { Study } from '../models/study';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
 
@Injectable()
export class StudyService {
    public selectedStudy: Study;
    private messager: ToastrService;
    public Step: Subject<Number> = new Subject<Number>();
    private _step: Number = 0;

    constructor(toastr: ToastrService) {
        this.messager = toastr;
    }

    public get checkingDelineatedPoint(): boolean {
        return (this._step === 2);
    }
    
    public SetStep(number) {
        this._step = number;
        this.Step.next(this._step);
    }

    public GetStep(): Number {
        return this._step;
    }
}