import { Component} from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import {AboutModalComponent} from './components/about/about.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[NgbModalConfig, NgbModal]
})

export class AppComponent {
  public title:string;

  constructor(config: NgbModalConfig, private modalService: NgbModal) {
   this.title = "USGS Time of Travel";

    config.backdrop = 'static';
    config.keyboard = false;
   }
//#region "Methods"
  public open(){
    const modalRef = this.modalService.open(AboutModalComponent);
    modalRef.componentInstance.title = 'About';
  }
//#endregion
}
