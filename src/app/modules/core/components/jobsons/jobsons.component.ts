import { Component, OnInit } from '@angular/core';
import { NgbModal,NgbActiveModal,NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-jobsons',
  templateUrl: './jobsons.component.html',
  styleUrls: ['./jobsons.component.css']
})
export class JobsonsModalComponent implements OnInit {

  public appVersion: string;

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal){
      // customize default values of modals used by this component tree
      config.backdrop = 'static';
      config.keyboard = false;

   }
   ngOnInit(){

   }

}
