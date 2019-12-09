import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportModalComponent implements OnInit {

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal) { 
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
  }

}
