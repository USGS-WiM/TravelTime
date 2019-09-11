// import { Component, OnInit, Inject, ViewChild } from '@angular/core';
// import { GetTimeoftravelService } from '../services/get-timeoftravel.service';
// import { MatDialogRef, MAT_DIALOG_DATA, MatProgressSpinnerModule } from '@angular/material';
// import { reach } from '../reach';
// import { MatDialog } from '@angular/material';
// import { PrintService } from '../services/print.service';
// import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
// import { MapService } from '../services/map.service';
// import { NgbPanelChangeEvent, NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
// import { ErrorDialogService } from '../services/error-dialog.service';
// import '../shared/extension-method';
// //import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; Object rearrangement

// @Component({
//   selector: 'tot-report',
//   templateUrl: './report.component.html',
//   styleUrls: []
// })

// export class reportComponent implements OnInit {

//   ngOnInit(): any {   //on init, get the services for first reach, and add them as parameters to accordion
//     this.showInputs = true;
//     this.openModal = true;
//     this._GetTimeoftravelService.getReach() // get reach
//       .toPromise().then(data => {
//         this.reach_reference = data;
//         this.onClick_addReach()
//       }); //get service {description: Initial description}
//     this.formGroup = new FormGroup({
//       activeEndDate: new FormControl(new Date(), { validators: [Validators.required, DateTimeValidator] })
//     }, { updateOn: 'change' });
//   }

//   constructor(
//     public dialogRef: MatDialogRef<ModalComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: ModalComponent,
//     private _GetTimeoftravelService: GetTimeoftravelService,
//     public _MapService: MapService,
//     public dialog: MatDialog,
//     public printService: PrintService,
//     public errorDialogService: ErrorDialogService
//   ) { }

//   @ViewChild('reaches') accordion1: NgbAccordion;
//   @ViewChild('acc') accordion: NgbAccordion;
//   model = {};
//   currentStep = 0;
//   showreaches = "Show Reaches";

//   beforeChange($event: NgbPanelChangeEvent) {
//     this.currentStep = +($event.panelId);
//   };

//   showhideReaches($event: NgbPanelChangeEvent) {
//     if ($event.nextState === false) {
//       this.showreaches = 'Show Reaches';
//     } else {
//       this.showreaches = 'Hide Reaches';
//       //console.log(this.mylist);
//     }
//   }

//   mylist = [];
//   reach_reference: reach;
//   ini_mass = this._MapService.ini_conc;
//   discharge = this._MapService.discharge;
//   id = []; //array for reach id's
//   output = [];
//   openModal: boolean;
//   showInputs: boolean;
//   showResult: boolean;
//   showProgress: boolean;
//   outputReach: number;
//   formGroup: FormGroup;
//   dateModel: Date = new Date();



//   onClick_addReach() {   //add class jobson to an array of items that has been iterated over on ui side
//     for (var i = 0; i < this._MapService.streamArray.length-2; i++) { //remove last traversing lines
//       if (this._MapService.streamArray[i].properties.nhdplus_comid) {
//         let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object
//         newreach.name = "Reach " + this._MapService.streamArray[i].properties.nhdplus_comid
//         newreach.parameters[0].value = (this._MapService.streamArray[i].properties.Discharge * 0.028316847)//.toUSGSvalue()
//         newreach.parameters[2].value = this._MapService.streamArray[i].properties.Slope
//         newreach.parameters[3].value = (this._MapService.streamArray[i].properties.DrainageArea*1000000)//.toUSGSvalue()
//         newreach.parameters[4].value = (this._MapService.streamArray[i].properties.Length * 1000)//.toUSGSvalue()
//         this.mylist.push(newreach);
//       } else {
//       }
//     }
//   };

//   onClick_removeReachLast() {  //remove last reach
//     this.mylist.pop();
//   }

//   onClick_removeReach(index) {   //remove reach by id
//     if (index >= 0) {
//       this.mylist.splice(index, this.mylist.length);
//       this.id.splice(index, this.mylist.length);
//     }
//   }

//   customTrackBy(index: number, obj: any): any {
//     return index;
//   }

//   reset = false;

//   onClick_postReach() {
//     if (this.dateModel instanceof Date) {
//     } else {
//       this.dateModel = new Date(this.dateModel);
//     }
//     this._GetTimeoftravelService.postReach(this.mylist, this._MapService.ini_conc, this.dateModel.toISOString())
//       .toPromise().then(data => this.output.push(data))
//       .catch((err) => {
//         console.log("error: ", err.message);
//         this.sendAlert(err, "Time of Travel Services");
//         this.showProgress = false;
//         this.showResult = false;
//         this.showInputs = true;
//       });
//   }

//   sendAlert(err, serv) {
//     let data = {};
//     data = {
//       //reason: error && error.error.reason ? error.error.reason : '',
//       status: err.status,
//       url: err.url,
//       service: serv
//     };
//     this.errorDialogService.openDialog(data);
//   }

//   onClick_uiResult() {
//     this.showInputs = false;
//     this.showProgress = true;
//     this.onClick_postReach();
//     setTimeout(() => {
//     this.showProgress = false;
//     this.showResult = true;
//     this.dialogRef.updateSize('90%', '90%');
//     }, 5000);
//   }

//     onClick_clear() {
//       this.discharge = null;
//       this.ini_mass = null;
//       this._MapService.discharge = null;
//       this._MapService.ini_conc = null;
//       this.dateModel = new Date(Date.parse(Date()));;
//       this.showResult = false;
//       this.showInputs = true;
//     }

//   onClick_return() {
//     this.dialogRef.updateSize('40%', '90%');
//     this.showResult = false;
//     this.showInputs = true;
//     this.output.length = 0;

//   }

//   setDischarge(event) {
//     if (this.mylist) {
//       console.log("so far so good");

//       this._MapService.discharge = this.discharge;


//       this.mylist.forEach((item) => {
//         item.parameters[1].value = this._MapService.discharge;
//         console.log(item.parameters[1].name);
//       })
//     }
//   }

//   setConc(event) {
//     if (this.mylist) {
//       this._MapService.ini_conc = this.ini_mass;
//     }
//   }

//   validateForm(mainForm) {

//     if (mainForm.$valid) {
//       return true;
//     }
//     else {
//       return false;
//     }
//   }

//   getLabel(label) {
//     try {
//       switch (label) {
//         case 'leadingEdge':
//           return 'Leading Edge';
//         case 'MostProbable':
//           return 'Most Probable';
//         case 'concentration':
//           return 'Concentration';
//         case 'time':
//           return 'Time';
//         case 'MaximumProbable':
//           return 'Maximum Probable';
//         case 'peakConcentration':
//           return 'Peak Concentration';
//         case 'trailingEdge':
//           return 'Trailing Edge';
//         case 'name':
//           return 'Name';
//         case 'description':
//           return 'Description';
//       }//end switch
//     } catch (e) {
//       var x = e;
//     }
//   }

//   selectGage() {
//     this.dialogRef.close();
//   }

//   //getUnits(shortname): any {
//   //  try {
//   //    switch (shortname) {
//   //      case 'sf':
//   //        return 'Streamflow (cubic feet per second)';
//   //      case 'drnarea':
//   //        return 'Drainage area (square miles)';
//   //      case 'l':
//   //        return 'Reach length (meters)';
//   //      case 'lc':
//   //        return 'Leading Edge Concentration (mg/L)';
//   //      case 'pc':
//   //        return 'Peak Concentration (mg/L)';
//   //      case 'tc':
//   //        return 'Trailing Edge Concentration (mg/L)';
//   //      case 'v':
//   //        return 'Velocity (meters per second)'
//   //    }//end switch
//   //  } catch (e) {
//   //    var x = e;
//   //  }
//   //}

//   returnSpan(spanstring) {
//     let cleanspan = spanstring;
//     if (cleanspan.startsWith("0")) {                                   //check for zero days
//       cleanspan = cleanspan.substr(cleanspan.indexOf(', ') + 2);
//       if (cleanspan.startsWith("0")) {                                       //check for zero hours
//         cleanspan = cleanspan.substr(cleanspan.indexOf(', ') + 2);
//         if (cleanspan.startsWith("0")) {                                     //check for zero minutes
//           cleanspan = cleanspan.substr(cleanspan.indexOf(', ') + 2);
//         }
//       }
//     }
//     return cleanspan;
//   }

//   getReach(reach) {
//     this.outputReach = Number(reach);
//     return this.outputReach;
//   }

//   /*drop(event: CdkDragDrop<string[]>) {
//     moveItemInArray(this.mylist, event.previousIndex, event.currentIndex);
//   }*/ //used for object rearrangement
// }
// export const DateTimeValidator = (fc: FormControl) => {
//   const date = new Date(fc.value);
//   const isValid = !isNaN(date.valueOf());
//   return isValid ? null : {
//     isValid: {
//       valid: false
//     }
//   };
// };
