import { Component, OnInit } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';

@Component({
  selector: 'tot-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  private StudyService: StudyService;
  private messanger: ToastrService;
  selectedReach: reach;
  reaches: reach[];
  setClickedRow: Function;
  selectedRow: Number;

  public get showResult$(): boolean {
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

  constructor(toastr: ToastrService, studyservice: StudyService) {
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.setClickedRow = function (index) {
      this.selectedRow = index; //memorise selected row
      this.selectedReach = this.reaches[index] //selected reach
      if (this.reaches[index].ischeked) {
        this.reaches[index].ischeked = false;
      } else {
        this.reaches[index]['ischeked'] = true;
      }
    }
  }

  ngOnInit() {
  }
}
