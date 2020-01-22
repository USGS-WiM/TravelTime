import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudyService } from '../../services/study.service';
import { reach } from '../../models/reach';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { MapService } from '../../services/map.services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportModalComponent implements OnInit {

  public reportTitle = "Time of Travel Report";
  public reportComments = "";

  private StudyService: StudyService;
  private MapService: MapService;
  private reaches: reach[];

  public get output$ () {
    if (this.StudyService.GetWorkFlow('totResults')) {
      this.reaches = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      this.reaches.shift(); //remove first element (one without results)

      return (this.reaches);
    } else {
      return;
    }
  }
  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, studyservice: StudyService, mapservice: MapService) { 
    config.backdrop = 'static';
    config.keyboard = false;
    this.StudyService = studyservice;
    this.MapService = mapservice;
  }

  ngOnInit() {
  }
}
