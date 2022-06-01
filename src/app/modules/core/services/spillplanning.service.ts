import { Injectable } from '@angular/core';
import { square } from '@turf/turf';
import { Toast, ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpillPlanningService {
  private messanger: ToastrService;


  public upstreamTOT() {
  }

  public relativeDrainage(D, MAF) { //D units (m), MAF units (m3/s)
    let D_a: number;
    D_a = (Math.pow(D, 1.25) * 3.13209) / MAF;
    return D_a;
  }

  public relativeDischarge(q = 0, MAF = 0) { //q units (m3/s), MAF units (m3/s)
    let Q_a: number;
    if (q > 0) {
      Q_a = q / MAF;
    } else {
      Q_a = 1;
    }
    return Q_a;
  }

  public peakVelocity(q, MAF, D, m) {//D units (m), q units (m3/s), MAF units (m3/s)
    let relativeDis: number;
    if (q > 0) {
      relativeDis = this.relativeDischarge(q, MAF);
    } else {
      relativeDis = this.relativeDischarge();
    }
    if (m === 'most') {
      let V_p = 0.02 + 0.051 * Math.pow(this.relativeDrainage(D, MAF), 0.821) * Math.pow(relativeDis, -0.465) * (q / D);
      return V_p;
    } else {
      let V_mp = 0.2 + 0.093 * Math.pow(this.relativeDrainage(D, MAF), 0.821) * Math.pow(relativeDis, -0.465) * (q / D);
      return V_mp;
    }
  }

  public peakTimeofTravel(L, q, MAF, D, m) { //L units (km), q units (m3/s), MAF units (m3/s), D units (sq m)
    let T: number;
      T = (L * 1000) / this.peakVelocity(q, MAF, D, m) * 0.000277778;   
    return T;
  }

  public unitPeakConcentration(L, q, MAF, D, m) {
    let C_up: number;
    let relativeDis: number;
    if (q > 0) {
      relativeDis = this.relativeDischarge(q, MAF);
    } else {
      relativeDis = this.relativeDischarge();
    }
    C_up = 857 * Math.pow(this.peakTimeofTravel(L, q, MAF, D, m), (-0.76 * Math.pow(relativeDis, (-0.079))));
    return C_up;
  }

  public leadingEdge(L, q = 0, MAF, D, m) {
    return (this.peakTimeofTravel(L, q, MAF, D, m) * 0.89);
  }

  public trailingEdge(L, q = 0, MAF, D, m) {
      return (2 * Math.pow(10, 6)) / (this.unitPeakConcentration(L, q, MAF, D, m) * 3600);
      //return ((2 * Math.pow(10, 6)) / (this.unitPeakConcentration(L, q, MAF, D, m)));
  }

  public passageTime(L, q = 0, MAF, D, m) {
      return ((this.leadingEdge(L, q, MAF, D, m) + this.trailingEdge(L, q, MAF, D, m)));
  }

  //Unit test according to jobsons example in the report, page 23
  public passageTimeTest(L = 0, q = 0, MAF = 0, D = 0, m) {
    console.log ("unit test")
    q = 1068;
    MAF = 730;
    D = 48 * Math.pow(10, 9);
    L = 104.8;

    let Q_r = (this.relativeDischarge(q, MAF)).toFixed(2);
    if (Q_r != "1.46") {
      this.messanger.show("Failed unit test, relative discharge");
    } else {
      this.messanger.show("Passed unit test, relative discharge");
    }

    let D_r = (this.relativeDrainage(D, MAF)).toFixed(2);
    if (D_r != "96396867095.29") {
      this.messanger.show("Failed unit test, compute relative drainage");
    } else {
      this.messanger.show("Passed unit test, relative drainage");
    }

    let P_v = this.peakVelocity(q, MAF, D, m).toFixed(2);
    if (P_v != "1.01") {
      this.messanger.show("Failed unit test, compute peak velocity");
    } else {
      this.messanger.show("Passed unit test, compute peak velocity");
    }

    let P_tot = this.peakTimeofTravel(L, q, MAF, D, m).toFixed(1);
    if (P_tot != "28.8") {
      this.messanger.show("Failed unit test, peak till time of travel");
    } else {
      this.messanger.show("Passed unit test, peak till time of travel")
    }

    let C_u = this.unitPeakConcentration(L, q, MAF, D, m).toFixed(1);
    if (C_u != "71.9") {
      this.messanger.show("Failed unit test,  unit peak concentration");
    } else {
      this.messanger.show("Passed unit test, unit peak concentration");
    }

    let T_l = this.leadingEdge(L, q, MAF, D, m).toFixed(1);
    if (T_l != "25.6") {
      this.messanger.show("Failed unit test,  time of leading edge");
    } else {
      this.messanger.show("Passed unit test,  time of leading edge");
    }

    let T_p = this.trailingEdge(L, q, MAF, D, m).toFixed(1);
    if (T_p != "7.7") {
      this.messanger.show("Failed unit test,  time of trailing edge");
    } else {
      this.messanger.show("Passed unit test, time of trailing edge");
    }

    let TOT = this.passageTime(L, q, MAF, D, m).toFixed(1);
    if (TOT != "33.4") {
      this.messanger.show("Failed unit test,  time of passage");
    } else {
      this.messanger.show("Passed unit test, time of passage");
    }
  }

  constructor(private http: HttpClient, toastr: ToastrService) {
    this.messanger = toastr;
  }
}
