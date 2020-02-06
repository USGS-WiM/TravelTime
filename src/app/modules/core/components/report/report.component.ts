import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudyService } from '../../services/study.service';
import { reach } from '../../models/reach';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { MapService } from '../../services/map.services';

@Component({
  selector: 'tot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportModalComponent implements OnInit {

  public reportTitle = "Time of Travel Report";
  public reportComments = "";
  //public print: any;

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

    //this.print = function () {
      //window.print();
  //};
  }

  ngOnInit() {
  }

  public onPrint() {
    // var div2Print=document.getElementById('print-content');
    // var newWin=window.open('','Print-Window');
    // newWin.document.open();
    // newWin.document.write('<html><body onload="window.print()">'+div2Print.innerHTML+'</body></html>');
    // newWin.document.close();
    // setTimeout(function(){newWin.close();},10);
    //window.print();
    this.printElement(document.getElementById("print-content"));
  }
  
  private printElement(elem) {
      var domClone = elem.cloneNode(true);
      
      var $printSection = document.getElementById("printSection");
      
      if (!$printSection) {
          $printSection = document.createElement("div");
          $printSection.id = "printSection";
          document.body.appendChild($printSection);
      }
      
      $printSection.innerHTML = "";
      $printSection.appendChild(domClone);
      window.print();
  }
}
