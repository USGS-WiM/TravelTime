import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal,NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { TravelTimeService } from '../../services/traveltimeservices.service';
import { MapService } from '../../services/map.services';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { reach } from '../../models/reach';
import { StudyService } from '../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
//import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
  selector: 'app-jobsons',
  templateUrl: './jobsons.component.html',
  styleUrls: ['./jobsons.component.css']
})
export class JobsonsModalComponent implements OnInit {

  public appVersion: string;
  public TravelTimeService: TravelTimeService;
  public StudyService: StudyService;
  public MapService: MapService;
  public dateModel: Date = new Date();
  public formGroup: FormGroup;
  public reach_reference: reach;
  public reachList: Array<any> = [];

  private _spillMass : Number;
  public get SpillMass() : Number {
    return this._spillMass;
  }
  public set SpillMass(v : Number) {
    this._spillMass = v;
    this.StudyService.selectedStudy.SpillMass = this._spillMass;
  }
  
  private _discharge : Number;
  public get Discharge() : Number {
    return this._discharge;
  }
  public set Discharge(v : Number) {
    this._discharge = v;
    this.StudyService.selectedStudy.Discharge = this._discharge;
  }
  
  public reachIDs = []; 
  private messager: ToastrService;

  @ViewChild('reaches') accordion1: NgbAccordion;
  @ViewChild('acc') accordion: NgbAccordion;
  public model = {};
  private currentStep = 0;
  public showhidetitle = "Show Reaches";
  public gettingResults: boolean = false;

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, traveltimeservice: TravelTimeService, mapservice: MapService, studyservice: StudyService, tstrservice: ToastrService){
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;

    this.TravelTimeService = traveltimeservice;
    this.MapService = mapservice;
    this.StudyService = studyservice;
    this.messager = tstrservice;
   }

  ngOnInit():  any {   //on init, get the services for first reach, and add them as parameters to accordion
    this.TravelTimeService.getJobsonConfigurationObject() // get reach
      .toPromise().then(data => {
        this.reach_reference = data;
        this.populateReachArray()
        this.formGroup = new FormGroup({
          activeEndDate: new FormControl(new Date(), { validators: [Validators.required, DateTimeValidator] })
        }, { updateOn: 'change' });
      }); //get service {description: Initial description}


    console.log (this.reachList);
  }

   //#region "Methods"
   public setDischarge(event): void {
    if (this.reachList) {
      this.StudyService.selectedStudy.Discharge = this._discharge;
      this.reachList.forEach((item) => {
        item.parameters[1].value = this.StudyService.selectedStudy.Discharge;
      })
    }
  }

  public setConc(event): void {
    if (this.reachList) {
      this.StudyService.selectedStudy.SpillMass = this._spillMass;
    }
  }

  public validateForm(mainForm): boolean {

    if (mainForm.$valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }

  public beforeChange($event: NgbPanelChangeEvent): void {
    this.currentStep = +($event.panelId);
  };

  public showhideReaches($event: NgbPanelChangeEvent): void {
    if ($event.nextState === false) {
      this.showhidetitle = 'Show Reaches';
    } else {
      this.showhidetitle = 'Hide Reaches';
    }
  }

  public removeReach(index): void {   //remove reach by id
    if (index >= 0) {
      this.reachList.splice(index, this.reachList.length);
      this.reachIDs.splice(index, this.reachList.length);
    }
  }

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
      }//end switch
    } catch (e) {
      var x = e;
    }
  }

  public getResults() {
    this.gettingResults = true;
    if (this.dateModel instanceof Date) {
    } else {
      this.dateModel = new Date(this.dateModel);
    }
    this.TravelTimeService.ExecuteJobson(this.StudyService.selectedStudy.SpillMass, this.dateModel.toISOString(), this.reachList)
      .toPromise().then(data => {
        this.StudyService.selectedStudy.Results.push(data);
        this.StudyService.SetWorkFlow("totResults", true);
        this.gettingResults = false;
      })
      .catch((err) => {
        console.log("error: ", err.message);
        this.sm(err, "Time of Travel Services")
        this.gettingResults = false;
      });
  }
  //#endregion

  //#region "Private methods"
  private populateReachArray(): void {   //add class jobson to an array of items that has been iterated over on ui side
    for (var i = 0; i < this.StudyService.selectedStudy.Reaches.length-2; i++) { //remove last traversing lines
      if (this.StudyService.selectedStudy.Reaches[i].properties.nhdplus_comid) {
        let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object
        newreach.name = "Reach " + this.StudyService.selectedStudy.Reaches[i].properties.nhdplus_comid
        newreach.parameters[0].value = (this.StudyService.selectedStudy.Reaches[i].properties.Discharge * 0.028316847)//.toUSGSvalue()
        newreach.parameters[2].value = this.StudyService.selectedStudy.Reaches[i].properties.Slope
        newreach.parameters[3].value = (this.StudyService.selectedStudy.Reaches[i].properties.DrainageArea*1000000)//.toUSGSvalue()
        newreach.parameters[4].value = (this.StudyService.selectedStudy.Reaches[i].properties.Length * 1000)//.toUSGSvalue()
        this.reachList.push(newreach);
        console.log(this.reachList);
      } else {
      }
    }
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) options = { timeOut: timeout };

      this.messager.show(msg, title, options, mType)
    }
    catch (e) {
    }
  }

}
