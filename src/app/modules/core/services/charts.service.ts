import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable()
export class ChartsService {

  myarray = [];
  private ResultReturn = new Subject<number[]>();
  return$ = this.ResultReturn.asObservable();

  constructor() {}

  public noticeAction(val: number) {
    this.myarray.push(val);
    this.ResultReturn.next(this.myarray);
  }
}
