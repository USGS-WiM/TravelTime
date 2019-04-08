import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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


  constructor(public dialog: MatDialog) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(AppComponentModal, {
      width: '500px',
      height: '500px',
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
export class AppComponentModal {

  constructor(
    public dialogRef: MatDialogRef<AppComponentModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
