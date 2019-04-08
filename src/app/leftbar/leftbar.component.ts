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
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css']
})
export class LeftbarComponent {
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
    const dialogRef = this.dialog.open(ReachConfigModal, {
      width: '500px',
      data: { location: this.location, volume: this.volume }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.volume = result;
    });
  }
}

@Component({
  selector: '../modal/modal.component',
  templateUrl: '../modal/modal.component.html',
  styleUrls: ['../modal/modal.component.css']
})
export class ReachConfigModal {

  constructor(
    public dialogRef: MatDialogRef<ReachConfigModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}


