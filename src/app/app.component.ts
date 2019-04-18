import { Component} from '@angular/core';
import { MatDialog } from '@angular/material';
import {ModalComponent} from '../app/modal/modal.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  mod_accordion: Object;
  constructor(public dialog: MatDialog) {}

  openDialog() {
    let dialog = this.dialog.open(ModalComponent);
  }
}