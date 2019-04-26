import { Component, OnInit, Inject} from '@angular/core';
import { GetTimeoftravelService } from '../services/get-timeoftravel.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { reach } from '../reach';
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
  showResult: boolean;
  arrayOut = [];

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalComponent,
    private _GetTimeoftravelService: GetTimeoftravelService
  ) { }

  ngOnInit(): any {   //on init, get the services for first reach, and add them as parameters to accordion
    this._GetTimeoftravelService.getReach() // get reach
      .subscribe(data => this.reach_reference = data); //get service {description: Initial description}
    this.showResult = false;
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
    this.onClick_postReach();
    this.showResult = true;
    //console.log(this.arrayOut);
  }

  onClick_clear() {
    //this.mylist = null; //TS edit: assigning to null removes object and subscriptions, we need to keep subscriptions but flush the rest of the list
    for (var i = 0; i < this.mylist.length+1; i++) {
      this.mylist.splice(0, 1);
    }
    for (var i = 0; i < this.output.length+1; i++) {
      this.output.splice(0, 1);
    }
    this.showResult = false;
  }

  checkList() {
    if (!Array.isArray(this.mylist) || !this.mylist.length) {
      this.onClick_addReach();
    }
  }
  //objectKeys(obj) {
  //  return Object.keys(obj);
  //}
  
  /*drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.mylist, event.previousIndex, event.currentIndex);
  }*/ //used for object rearrangement
}


