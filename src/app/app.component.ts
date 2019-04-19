import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GetTimeoftravelService } from './services/get-timeoftravel.service';
import { reach } from './reach';

export interface DialogData {
  jobson: {
    location: [];
    volume: number;
    distance: number;
    locationDS: [];
    DA: number;
    discharge: number;
    MAFlow: number;
    slope: number;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Time of Travel';

  location: [];
  volume: number;
  distance: number;
  locationDS: [];
  flow: number;
  discharge: number;
  MAflow: number;
  slope: number;
  mylist = [];

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(AppComponentModal, {
      width: '60%',
      height: '80%',
      data: { location: this.location, volume: this.volume }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.volume = result;
    });
  }
  //public startSearch(e) {
  //  e.stopPropagation(); e.preventDefault();
  //  $("#searchBox").trigger($.Event("keyup", { "keyCode": 13 }));
  //}
}

@Component({
  selector: './modal/modal.component',
  templateUrl: './modal/modal.component.html',
  styleUrls: ['./modal/modal.component.css']
})
export class AppComponentModal implements OnInit {
  mylist = [];
  reach_reference: reach;
  ini_mass: number;
  ini_time: number;
  new_reach: reach;
  output: {};

  constructor(
    public dialogRef: MatDialogRef<AppComponentModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _GetTimeoftravelService: GetTimeoftravelService
  ) {}
  ngOnInit(): any {
    //on init, get the services for first reach, and add them as parameters to accordion
    this._GetTimeoftravelService
      .getReach() // get reach
      .subscribe(data => (this.reach_reference = data)); //get service {description: Initial description}
    this.new_reach = this.reach_reference;
  }

  onClick_addReach() {
    //add class jobson to an array of items that has been iterated over on ui side
    let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object
    this.mylist.push(newreach); //push the object to the array of reaches
  }

  onClick_removeReachLast() {
    //remove last reach
    this.mylist.pop();
  }

  onClick_removeReach(index) {
    //remove reach by id
    if (index >= 0) {
      this.mylist.splice(index, 1);
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  onClick_postReach() {
    this._GetTimeoftravelService.postReach(this.mylist, this.ini_mass, this.ini_time).subscribe(data => (this.output = data));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
