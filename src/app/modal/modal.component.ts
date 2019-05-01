import { Component, OnInit, Inject} from '@angular/core';
import { GetTimeoftravelService } from '../services/get-timeoftravel.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatProgressSpinnerModule } from '@angular/material';
import { reach } from '../reach';
import { MatDialog } from '@angular/material';
import { PrintService } from '../services/print.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; Object rearrangement

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {

  mylist = [];
  reach_reference: reach;
  ini_mass: number;
  ini_time: number;
  id = []; //array for reach id's
  output = [];
  openModal: boolean;
  showInputs: boolean;
  showResult: boolean;
  showProgress: boolean;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalComponent,
    private _GetTimeoftravelService: GetTimeoftravelService,
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
  }

  onClick_addReach() {   //add class jobson to an array of items that has been iterated over on ui side
    let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object

    //newreach.name = "Reach " + (this.id.length + 1); //TS This is bug because: (add reach 4, remove reach 2 and add again- it will be 4 because length again 4 resulting in two reaches with name "Reach 4") (added solution-line 49)

    this.mylist.push(newreach);    //push the object to the array of reaches
    if (this.mylist.length > 1) { 
      this.id.push(this.id[this.id.length - 1] + 1); //take the last value of id and add one
    } else {
      this.id = [];
      this.id.push(1); //at any time when only one reach start id from 1 
    }
    this.mylist[(this.mylist.length) - 1].name = "Reach " + this.id[(this.id.length)-1] //Modified default naming
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
    this._GetTimeoftravelService.postReach(this.mylist, this.ini_mass, this.ini_time)
      .subscribe(data => this.output.push(data));
    console.log(this.output);
  }

  onClick_uiResult() {
    this.showInputs = false;
    this.showProgress = true;
    this.onClick_postReach();
    setTimeout(() => {
      this.showProgress = false;
      this.showResult = true;
    }, 2000);
    
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
  }

  onPrintInvoice() {
    const invoiceIds = ['101', '102'];
    this.printService
      .printDocument('invoice', invoiceIds);
  }

  validateForm(mainForm) {
    if (mainForm.$valid) {
        return true;
    }
    else {
        return false;
    }
}

  /*drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.mylist, event.previousIndex, event.currentIndex);
  }*/ //used for object rearrangement
}


