import { Component, OnInit } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { MapService } from '../../services/map.services';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';
import * as $ from 'jquery';

@Component({
  selector: 'tot-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  private MapService: MapService;
  private StudyService: StudyService;
  private messanger: ToastrService;
  selectedReach: reach;
  reaches: reach[];
  setClickedRow: Function;
  selectedRow: Number;

  public get showResult$(): boolean {
    if (this.StudyService.GetWorkFlow('totResults')) {
      $(".footer").css("height", "30vh");
    }
    return (this.StudyService.GetWorkFlow('totResults'));
  }

  public get output$ () {
    if (this.StudyService.GetWorkFlow('totResults')) {
      this.reaches = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      this.reaches.shift(); //remove first element (one without results)
      return (this.reaches);
    } else {
      return;
    }
  }

  constructor(toastr: ToastrService, studyservice: StudyService, mapservice: MapService) {
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.MapService = mapservice;
    this.setClickedRow = function (index) {
      this.selectedRow = index; //memorise selected row
      this.selectedReach = this.reaches[index] //selected reach
      if (this.reaches[index].ischeked) { //change 
        this.reaches[index].ischeked = false;
      } else {
        this.reaches[index]['ischeked'] = true;
      }
      //console.log(this.selectedReach);
    }
  }

  public highlightFeature(indx) {
    this.MapService.HighlightFeature('Flowlines', indx+1);
  }

  ngOnInit() {
  }

}
