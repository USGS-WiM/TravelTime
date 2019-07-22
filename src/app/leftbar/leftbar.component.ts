import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import {ModalComponent} from '../modal/modal.component';
import {MapComponent} from '../map/map.component';

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css'],
  providers: [MapComponent]
})


export class LeftbarComponent {
  constructor(
    public dialog: MatDialog,
    private _MapComponent: MapComponent
  ) { }



  getUpstream() {
    this._MapComponent.getUpstream();
  }

  getDownstream() {
    this._MapComponent.getDownstream();
  }

}


