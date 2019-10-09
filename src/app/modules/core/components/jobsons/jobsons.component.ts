import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal,NgbActiveModal,NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { TravelTimeService } from '../../services/traveltimeservices.service';
import { MapService } from '../../services/map.services';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { reach } from '../../models/reach';
import { StudyService } from '../../services/study.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
  public spill_mass: Number;
  public discharge: Number;
  public reachIDs = []; 

  @ViewChild('reaches') accordion1: NgbAccordion;
  @ViewChild('acc') accordion: NgbAccordion;
  public model = {};
  private currentStep = 0;
  public showreaches = "Show Reaches";

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, traveltimeservice: TravelTimeService, mapservice: MapService, studyservice: StudyService){
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;

    this.TravelTimeService = traveltimeservice;
    this.MapService = mapservice;
    this.StudyService = studyservice;
   }

   ngOnInit():  any {   //on init, get the services for first reach, and add them as parameters to accordion
    this.spill_mass = this.StudyService.selectedStudy.SpillMass;
    this.discharge = this.StudyService.selectedStudy.Discharge;
    this.TravelTimeService.getJobsonConfigurationObject() // get reach
      .toPromise().then(data => {
        this.reach_reference = data;
        this.populateReachArray()
      }); //get service {description: Initial description}
    this.formGroup = new FormGroup({
      activeEndDate: new FormControl(new Date(), { validators: [Validators.required, DateTimeValidator] })
    }, { updateOn: 'change' });
   }

   //#region "Methods"
   public setDischarge(event): void {
    if (this.reachList) {
      console.log("so far so good");

      this.StudyService.selectedStudy.Discharge = this.discharge;

      this.reachList.forEach((item) => {
        item.parameters[1].value = this.StudyService.selectedStudy.Discharge;
        console.log(item.parameters[1].name);
      })
    }
  }

  public setConc(event): void {
    if (this.reachList) {
      this.StudyService.selectedStudy.SpillMass = this.spill_mass;
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
      this.showreaches = 'Show Reaches';
    } else {
      this.showreaches = 'Hide Reaches';
    }
  }

  public onClick_removeReach(index): void {   //remove reach by id
    if (index >= 0) {
      this.reachList.splice(index, this.reachList.length);
      this.reachIDs.splice(index, this.reachList.length);
    }
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
      } else {
      }
    }
  };

}
