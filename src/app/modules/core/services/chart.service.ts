import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

export interface DisplayBlocks { most: boolean, max: boolean };

@Injectable()
export class ChartService {

  constructor() { }
  myarray = [];
  newval: DisplayBlocks = { most: true, max: false };

  //DISPLAY FOOTER AND CHARTS;
  private DisplayBlock: Subject<DisplayBlocks> = new Subject<any>();
  display$ = this.DisplayBlock.asObservable();

  public displayAction(key, val) {
    this.newval[key] = val;
    this.DisplayBlock.next(this.newval);
  }

  //NOTICE ACTION, SELECT FROM THE FOOTER;
  private ResultReturn = new Subject<number[]>();
  return$ = this.ResultReturn.asObservable();

  public noticeAction(val: number) {
    this.myarray.push(val);
    this.ResultReturn.next(this.myarray);
  }
}
