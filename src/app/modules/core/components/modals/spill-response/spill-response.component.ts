import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TravelTimeService } from '../../../services/traveltimeservices.service';
import { MapService } from '../../../services/map.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { reach } from '../../../models/reach';
import { StudyService } from '../../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../../../shared/messageType';
import { BehaviorSubject } from 'rxjs';
//import { GagesmodalComponent } from '../gagesmodal/gagesmodal.component';
import { round } from '@turf/turf';
//import { NWISService } from '../../services/nwisservices.service'
import { GagesComponent } from '../gages/gages.component';
import { NWISService } from '../../../services/nwisservices.service'

export const DateTimeValidator = (fc: FormControl) => {
  const date = new Date(fc.value);
  const isValid = !isNaN(date.valueOf());
  return isValid ? null : {
    isValid: {
      valid: false
    }
  };
};

@Component({
  selector: 'app-spill-response',
  templateUrl: './spill-response.component.html',
  styleUrls: ['./spill-response.component.scss']
})
export class SpillResponseComponent implements OnInit {

  public gages;
  public ShowGages: boolean = false;
  public NWISService: NWISService;
  public appVersion: string;
  public TravelTimeService: TravelTimeService;
  public StudyService: StudyService;
  public MapService: MapService;
  public dateModel: Date = new Date();
  public formGroup: FormGroup;
  public reach_reference: reach;
  public reachList: Array<any> = [];
  public units;
  public abbrev;
  public inputIsValid: boolean = false;
  private _spillMass: number;
  private _discharge: number;
  private _recoveryratio = 1;
  public dischargeSub = new BehaviorSubject<number>(undefined);
  public reachIDs = [];
  private messager: ToastrService;
  public model = {};
  public showhidetitle = 'Show Reaches';
  public showReaches: boolean = true;
  public gettingResults: boolean = false;
  public showDetails: Array<any>;
  public reachesReady: boolean = false;
  private lastIndex = null;
  private selectedIndex = null;
  private currentStep = 0;
  public FirstReachDischarge;
  public recratio: number;

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, traveltimeservice: TravelTimeService, mapservice: MapService, studyservice: StudyService, tstrservice: ToastrService, private modalService: NgbModal, public nwisservice: NWISService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.TravelTimeService = traveltimeservice;
    this.MapService = mapservice;
    this.NWISService = nwisservice;
    this.StudyService = studyservice;
    this.messager = tstrservice;
  }

  ngOnInit(): any {   // on init, get the services for first reach, and add them as parameters to accordion
    this.TravelTimeService.getJobsonConfigurationObject() // get reach
      .toPromise().then(data => {
        this.reach_reference = data;
        this.units = this.MapService.unitsOptions;
        this.abbrev = this.MapService.abbrevOptions;
        this.populateReachArray();
      }); // get service {description: Initial description}
    this.formGroup = new FormGroup({
      activeEndDate: new FormControl(new Date(), { validators: [Validators.required, DateTimeValidator] })
    }, { updateOn: 'change' });

    this.StudyService.dateSub.subscribe(result => {
      this.dateModel = result;
    })

    this.NWISService.gagesArray.subscribe(data => {
      if (typeof (data) != 'undefined') {
        this.nwisservice.showGages.subscribe(data => {
          this.ShowGages = data;
        })
      } else { }
    })
  }

  //#region "Gages"
  public openGagesModal() {

    //update gages flow for a specific date time here if gages modal open
    //get real time flow values
    //this.NWISService.getRealTimeFlow(this.dateModel, this.NWISService.gagesArray.value);

    //const modalConfig = this.modalService.open(GagesmodalComponent);
    //modalConfig.componentInstance.title = 'Gages';
  }
  //#endregion

  //#region "Ui input"
  @ViewChild('reaches', { static: false }) accordion1: NgbAccordion;
  @ViewChild('acc', { static: false }) accordion: NgbAccordion;
  //#endregion

  //#region "Setters"

  public get Recratio(): number {
    return this.recratio;
  }
  public set Recratio(v: number) {
    this.recratio = v;
    //this.updateRecRatio(v);
  }

  public get SpillMass(): number {
    return this._spillMass;
  }
  public set SpillMass(v: number) {
    this._spillMass = v;
    this.StudyService.selectedStudy.SpillMass = this._spillMass;
  }
  public get Discharge(): number {
    return this._discharge;
  }
  public set Discharge(v: number) {
    this._discharge = v;
    this.StudyService.selectedStudy.Discharge = this._discharge;
  }
  public set RecoveryRatio(v: number) {
    this._recoveryratio = v;
    this.StudyService.selectedStudy.RecoveryRatio = this._recoveryratio;
  }
  public get RecoveryRatio(): number {
    return this._recoveryratio;
  }
  private _dtData: boolean = true;
  public get HasDTData(): boolean {
    return this._dtData;
  }
  private _useDTData: boolean;
  public get UseDTData(): boolean {
    return this._useDTData;
  }
  public set UseDTData(v: boolean) {
    this._useDTData = v;
  }
  //#endregion

  log(val) { console.log(val); }

  public validateInputs(): boolean {
    if (typeof (this.SpillMass) === "number" && typeof (this.Discharge) === "number" && typeof (this.RecoveryRatio) === "number") {
        return false;
    } else {
        return true;
    }
  }

  public updateDischarge(): void {
    this.FirstReachDischarge = (this.reachList[0]['parameters'][0].value).toFixed(2);
  }

  public updateRecRatio(v:number) {
    this.reachList.forEach((item) => {
      item.parameters[5].value = v;
      console.log(item.parameters[5]);
    })
  }


   //#region "Methods"
  public setParameters(): void {
    this.setDischarge();
    this.setRecoveryRatio();
  }
  public setDischarge(): void {
    if (this.reachList.length > 0) {
      this.StudyService.selectedStudy.Discharge = this._discharge;
      let accumRatio = [this._discharge];
      let cond = false;
      let value;

      // current function is using ratio of i-th - 1 reach, it can be easily adjusted to nearest gage flow value;
      this.reachList.forEach((item) => {
        if (cond) {
          item.parameters[1].value = (accumRatio[accumRatio.length - 1] * item.parameters[0].value).toFixed(3); // Number(this.StudyService.selectedStudy.Discharge) *
          value = (item.parameters[1].value / item.parameters[0].value).toFixed(3);
          accumRatio.push(value);
        } else {
          item.parameters[1].value = this._discharge;
          value = (item.parameters[1].value / item.parameters[0].value).toFixed(3);
          accumRatio.push(value);
          cond = true;
        }
      });
      this.StudyService.SetWorkFlow('hasDischarge', true);
    } else {
      this.setDischarge();
    }

    this.StudyService.setDischarge(this._discharge);
  }

  public setRecoveryRatio(): void {
    if (this.reachList.length > 0) {
      this.StudyService.selectedStudy.RecoveryRatio = this.RecoveryRatio;
      this.reachList.forEach((item) => {
          item.parameters[5].value = this.RecoveryRatio; 
      });
    } 
    this.StudyService.setRecoveryRatio(this.RecoveryRatio);
  }

  public setConc(event): void {
    if (this.reachList) {
      this.StudyService.selectedStudy.SpillMass = this._spillMass;
      this.StudyService.setConcentration(this._spillMass);
    }
  }

  public validateForm(mainForm): boolean {
      console.log(mainForm.$valid);
    if (mainForm.$valid) {
      return true;
    } else {
      return false;
    }
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }

  public beforeChange($event: NgbPanelChangeEvent): void {
    this.currentStep = +($event.panelId);
  }
  //Future enhancement - allowing user to remove gage parameters.
  /*public removeReach(index): void {   // remove reach by id
    if (index >= 0) {
      this.reachList.splice(index, this.reachList.length);
      this.reachIDs.splice(index, this.reachList.length);
    }
  }*/

  public getLabel(label) {
    try {
      switch (label) {
        case 'leadingEdge':
          return 'Leading Edge';
        case 'MostProbable':
          return 'Most Probable';
        case 'concentration':
          return 'Concentration';
        case 'time':
          return 'Time';
        case 'MaximumProbable':
          return 'Maximum Probable';
        case 'peakConcentration':
          return 'Peak Concentration';
        case 'trailingEdge':
          return 'Trailing Edge';
        case 'name':
          return 'Name';
        case 'description':
          return 'Description';
      }// end switch
    } catch (e) {
      let x = e;
    }
  }

  public getResults() {

	// Set default footer height to half, show buttons to switch
	$('#mapWrapper').attr('class', 'half-map');
	$('#mapHeightToggle').attr('class', 'visible');

    this.gettingResults = true;

 if (this.dateModel instanceof Date) {
    } else {
      this.dateModel = new Date(this.dateModel);
    }
 let tempReachList = [];
 let postReachList = [];
 if (!this.StudyService.isMetric()) {
      for (let i = 0; i < this.reachList.length; i++) {
        let newreach = new reach(this.reach_reference); // new Jobson reaches object that will store initial object
        newreach.name = this.reachList[i].name;
        newreach.parameters[2].value = this.reachList[i].parameters[2].value;                   // slope
        newreach.parameters[1].value = (this.reachList[i].parameters[1].value * 0.028316847);   // real-time discharge from cfs to cms
        newreach.parameters[0].value = (this.reachList[i].parameters[0].value * 0.028316847);   // mean annual discharge from cfs to cms
        newreach.parameters[3].value = (this.reachList[i].parameters[3].value / 0.00000038610215855); // drainage area from square miles to square meters
        newreach.parameters[4].value = (this.reachList[i].parameters[4].value / 3.2808);        // length from feet to meters

        newreach.parameters[0].unit.unit = this.units.metric['discharge'];   // mean annual discharge
        newreach.parameters[0].unit.abbr = this.abbrev.metric['discharge'];
        newreach.parameters[1].unit.unit = this.units.metric['discharge'];   // real-time discharge
        newreach.parameters[1].unit.abbr = this.abbrev.metric['discharge'];
        newreach.parameters[2].unit.unit = this.units.metric['slope'];
        newreach.parameters[2].unit.abbr = this.abbrev.metric['slope'];
        newreach.parameters[3].unit.unit = this.units.metric['drainageArea'];
        newreach.parameters[3].unit.abbr = this.abbrev.metric['drainageArea'];
        newreach.parameters[4].unit.unit = this.units.metric['distance'];
        newreach.parameters[4].unit.abbr = this.abbrev.metric['distance'];

        tempReachList.push(newreach);
      }
      tempReachList.forEach(reach => {
        reach.parameters.splice(6, 1);
        postReachList.push(reach);
      });
      this.StudyService.selectedStudy.SpillMass = this.StudyService.selectedStudy.SpillMass * 0.453592;
    } else {
      this.reachList.forEach(reach => {
        reach.parameters.splice(6, 1);
        postReachList.push(reach);
      });
    }

 this.TravelTimeService.ExecuteJobson(this.StudyService.selectedStudy.SpillMass, this.dateModel.toISOString(), postReachList)
   .toPromise().then(data => {
        this.StudyService.selectedStudy.Results = data;
        this.StudyService.SetWorkFlow('totResults', true);
        this.gettingResults = false;
        this.activeModal.dismiss();
        this.StudyService.setProcedure(3); // open next panel;
      })
      .catch((err) => {
        console.log('error: ', err.message);
        this.sm(err, 'Time of Travel Services');
        this.gettingResults = false;
      });
  }

  public openCloseItem(index): void {
    this.selectedIndex = index;
    if (this.reachList[this.selectedIndex].parameters.show) {
      this.reachList[this.selectedIndex].parameters.show = false;
    } else {
      if (this.lastIndex !== null) {
        this.reachList[this.lastIndex].parameters.show = false;
      }
      this.reachList[this.selectedIndex].parameters.show = true;
    }
    this.lastIndex = this.selectedIndex;
  }

  public identify(index, item): number {
    return item.id;
 }

  private populateReachArray(): void {   // add class jobson to an array of items that has been iterated over on ui side
    for (let i = 0; i < this.StudyService.selectedStudy.Reaches.length; i++) { // remove last traversing lines
      if (this.StudyService.selectedStudy.Reaches[i].properties.nhdplus_comid) {
        let newreach = new reach(this.reach_reference); // new Jobson reaches object that will store initial object
        if (i > 0) { newreach.description = "reach" };
        newreach.name = this.StudyService.selectedStudy.Reaches[i].properties.nhdplus_comid;
        newreach.parameters[2].value = this.StudyService.selectedStudy.Reaches[i].properties.Slope;

        let selectedUnits;
        if (this.StudyService.isMetric()) {
          selectedUnits = this.units.metric;
          newreach.parameters[0].value = round((this.StudyService.selectedStudy.Reaches[i].properties.Discharge * 0.028316847), 3); // cfs to cms
          newreach.parameters[3].value = (this.StudyService.selectedStudy.Reaches[i].properties.DrainageArea * 1000000).toFixed(0); // square kilometers to square meters
          newreach.parameters[4].value = (this.StudyService.selectedStudy.Reaches[i].properties.Length * 1000).toFixed(3); // kilometers to meters
        } else {
          selectedUnits = this.units.imperial;
          newreach.parameters[0].value = round((this.StudyService.selectedStudy.Reaches[i].properties.Discharge), 3); // cfs
          newreach.parameters[3].value = (this.StudyService.selectedStudy.Reaches[i].properties.DrainageArea * 0.386102).toFixed(0); // square kilometers to square miles
          newreach.parameters[4].value = (this.StudyService.selectedStudy.Reaches[i].properties.Length * 3280.84).toFixed(3); // kilometers to feet
        }
        newreach.parameters[0].unit.unit = selectedUnits['discharge'];   // mean annual discharge
        newreach.parameters[1].unit.unit = selectedUnits['discharge'];   // real-time discharge
        newreach.parameters[2].unit.unit = selectedUnits['slope'];
        newreach.parameters[3].unit.unit = selectedUnits['drainageArea'];
        newreach.parameters[4].unit.unit = selectedUnits['distance'];

        this.reachList.push(newreach);
      } else {
      }
    }
      this.reachesReady = true;
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) options = { timeOut: timeout };

      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }
    //#endregion

}
