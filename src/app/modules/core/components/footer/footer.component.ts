import { Component, OnInit } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { MapService } from '../../services/map.services';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';
import * as $ from 'jquery';
import { ChartsService } from '../../services/charts.service';
import '../../../../shared/extensions/number.toUSGSValue';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tot-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  private MapService: MapService;
  private StudyService: StudyService;
  private ChartService: ChartsService;
  private messanger: ToastrService;

  private showMost: boolean;
  private showMax: boolean;
  public spillMass;
  public spillDate;

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
  
  public get output$() {
    
    if (this.StudyService.GetWorkFlow('totResults')) {
      this.reaches = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      this.reaches.shift(); //remove first element (one without results)

      //apply rounding function ?

      this.reaches.forEach((o => {
        o.result["equations"]["v"]["value"] = (o.result["equations"]["v"]["value"]).toUSGSvalue();
        o.result["tracer_Response"]["peakConcentration"]["MostProbable"]["concentration"] = (o.result["tracer_Response"]["peakConcentration"]["MostProbable"]["concentration"]).toUSGSvalue();
        o.result["tracer_Response"]["trailingEdge"]["MostProbable"]["concentration"] = (o.result["tracer_Response"]["trailingEdge"]["MostProbable"]["concentration"]).toUSGSvalue();
        o.result["tracer_Response"]["peakConcentration"]["MaximumProbable"]["concentration"] = (o.result["tracer_Response"]["peakConcentration"]["MaximumProbable"]["concentration"]).toUSGSvalue();
        o.result["tracer_Response"]["trailingEdge"]["MaximumProbable"]["concentration"] = (o.result["tracer_Response"]["trailingEdge"]["MaximumProbable"]["concentration"]).toUSGSvalue();
      }));



     //console.log(this.reaches);
      return (this.reaches);
    } else {
      return;
    }
  }

  constructor(toastr: ToastrService, studyservice: StudyService, mapservice: MapService, chartservice: ChartsService) {
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.MapService = mapservice;
    this.ChartService = chartservice;
    this.setClickedRow = function (index) {
      this.selectedRow = index; //memorise selected row
      this.selectedReach = this.reaches[index] //selected reach
      if (this.reaches[index].ischeked) { //change 
        this.reaches[index].ischeked = false;
      } else {
        this.reaches[index]['ischeked'] = true;
      }
    }
  }

  public highlightFeature(indx) {
    this.ChartService.noticeAction(indx);
    this.MapService.HighlightFeature('Flowlines', Number(this.output$[indx].name.replace(/^\D+/g, '')));
  }

  ngOnInit() {
    this.ChartService.display$.subscribe(isShown => {
      this.showMax = isShown.max;
      this.showMost = isShown.most;
    });

    this.StudyService.study$.subscribe(mystudy => {
      this.spillMass = mystudy.SpillMass;
      this.spillDate = mystudy.SpillDate;
    })
  }

}
