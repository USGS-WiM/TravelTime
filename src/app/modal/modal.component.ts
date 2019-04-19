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
  output = [];

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalComponent,
    private _GetTimeoftravelService: GetTimeoftravelService
  ) { }

  ngOnInit(): any {   //on init, get the services for first reach, and add them as parameters to accordion
    this._GetTimeoftravelService.getReach() // get reach
      .subscribe(data => this.reach_reference = data); //get service {description: Initial description}
  }

  onClick_addReach() {   //add class jobson to an array of items that has been iterated over on ui side
    let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object
    this.mylist.push(newreach);    //push the object to the array of reaches
  };

  onClick_removeReachLast() {  //remove last reach
    this.mylist.pop();
  }

  onClick_removeReach(index) {   //remove reach by id
    if (index >= 0) {
      this.mylist.splice(index, 1);
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  onClick_postReach() {
    this._GetTimeoftravelService.postReach(this.mylist, this.ini_mass, this.ini_time)
      .subscribe(data => this.output.push(data));
  }

  onClick_uiResult() {
    this.onClick_postReach();
    console.log(this.output);
  }

  /*drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.mylist, event.previousIndex, event.currentIndex);
  }*/ //used for object rearrangement
}
