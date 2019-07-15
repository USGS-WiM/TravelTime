import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { GetTimeoftravelService } from '../services/get-timeoftravel.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatProgressSpinnerModule } from '@angular/material';
import { reach } from '../reach';
import { MatDialog } from '@angular/material';
import { PrintService } from '../services/print.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MapService } from '../services/map.service';
import { NgbPanelChangeEvent, NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
//import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; Object rearrangement

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {
  @ViewChild('acc') accordion: NgbAccordion;
  model = {};
  currentStep = 0;

  beforeChange($event: NgbPanelChangeEvent) {
    this.currentStep = +($event.panelId);
  };

  mylist = [];
  reach_reference: reach;
  ini_mass: number;
  //ini_time: number;
  id = []; //array for reach id's
  output = [];
  openModal: boolean;
  showInputs: boolean;
  showResult: boolean;
  showProgress: boolean;
  outputReach: number;
  formGroup: FormGroup;
  dateModel: Date = new Date();
  //stringDateModel: string = new Date().toISOString();

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalComponent,
    private _GetTimeoftravelService: GetTimeoftravelService,
    private _MapService: MapService,
    public dialog: MatDialog,
    public printService: PrintService
  ) { }

  ngOnInit(): any {   //on init, get the services for first reach, and add them as parameters to accordion
    this.showInputs = true;
    this.openModal = true;
    this._GetTimeoftravelService.getReach() // get reach
      .toPromise().then(data => {
        this.reach_reference = data;
        this.onClick_addReach()
      }); //get service {description: Initial description}
    this.formGroup = new FormGroup({
      activeEndDate: new FormControl(new Date(), { validators: [Validators.required, DateTimeValidator] })
    }, { updateOn: 'change' });
  }

  onClick_addReach() {   //add class jobson to an array of items that has been iterated over on ui side
    for (var i = 1; i < this._MapService.streamArray.length; i++) {
      if (this._MapService.streamArray[i].properties.nhdplus_comid) {
        let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object
        newreach.name = "Reach " + this._MapService.streamArray[i].properties.nhdplus_comid
        this.mylist.push(newreach);
      } else {
      }
    }

  };

  onClick_removeReachLast() {  //remove last reach
    this.mylist.pop();
  }

  onClick_removeReach(index) {   //remove reach by id
    if (index >= 0) {
      this.mylist.splice(index, 1);
      this.id.splice(index, 1);
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  onClick_postReach() {
    this._GetTimeoftravelService.postReach(this.mylist, this.ini_mass, this.dateModel.toISOString())
      .subscribe(data => this.output.push(data));
  }

  onClick_uiResult() {
    this.showInputs = false;
    this.showProgress = true;
    this.onClick_postReach();
    setTimeout(() => {
      this.showProgress = false;
      this.showResult = true;
    }, 2000);
    console.log(this.mylist);
  }

  onClick_clear() {
    //this.mylist = null; //TS edit: assigning to null removes object and subscriptions, we need to keep subscriptions but flush the rest of the list
    while (this.mylist.length != 0) {
      this.mylist.splice(0, 1)
    }
    while (this.output.length != 0) {
      this.output.splice(0, 1);
    }
    this.showResult = false;
    this.showInputs = true;
    this.onClick_addReach();
  }

  onClick_return() {
    this.showResult = false;
    this.showInputs = true;

    this.output.length = 0;
  }

  validateForm(mainForm) {

    if (mainForm.$valid) {
      return true;
    }
    else {
      return false;
    }
  }

  getLabel(label) {
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

  //getUnits(shortname): any {
  //  try {
  //    switch (shortname) {
  //      case 'sf':
  //        return 'Streamflow (cubic feet per second)';
  //      case 'drnarea':
  //        return 'Drainage area (square miles)';
  //      case 'l':
  //        return 'Reach length (meters)';
  //      case 'lc':
  //        return 'Leading Edge Concentration (mg/L)';
  //      case 'pc':
  //        return 'Peak Concentration (mg/L)';
  //      case 'tc':
  //        return 'Trailing Edge Concentration (mg/L)';
  //      case 'v':
  //        return 'Velocity (meters per second)'
  //    }//end switch
  //  } catch (e) {
  //    var x = e;
  //  }
  //}

  returnSpan(spanstring) {
    let cleanspan = spanstring;
    if (cleanspan.startsWith("0")) {                                   //check for zero days
      cleanspan = cleanspan.substr(cleanspan.indexOf(', ') + 2);
      if (cleanspan.startsWith("0")) {                                       //check for zero hours
        cleanspan = cleanspan.substr(cleanspan.indexOf(', ') + 2);
        if (cleanspan.startsWith("0")) {                                     //check for zero minutes
          cleanspan = cleanspan.substr(cleanspan.indexOf(', ') + 2);
        }
      }
    }
    return cleanspan;
  }

  getReach(reach) {
    this.outputReach = Number(reach);
    console.log(this.outputReach);
    return this.outputReach;
  }

  /*drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.mylist, event.previousIndex, event.currentIndex);
  }*/ //used for object rearrangement
}
export const DateTimeValidator = (fc: FormControl) => {
  const date = new Date(fc.value);
  const isValid = !isNaN(date.valueOf());
  return isValid ? null : {
    isValid: {
      valid: false
    }
  };
};
