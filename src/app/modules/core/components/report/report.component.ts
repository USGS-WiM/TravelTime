import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudyService } from '../../services/study.service';
import { reach } from '../../models/reach';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { MapService } from '../../services/map.services';
import { TravelTimeService } from '../../services/traveltimeservices.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Study } from '../../models/study';
import { MapComponent } from '../map/map.component';

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
  private TravelTimeService: TravelTimeService;
  private reaches: reach[];
  private reach_reference: reach;
  public units;
  public abbrev;

  public get output$ () {
    if (this.StudyService.GetWorkFlow('totResults')) {
      return (this.reaches);
    } else {
      return;
    }
  }
  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, studyservice: StudyService, mapservice: MapService, traveltimeservice: TravelTimeService) { 
    config.backdrop = 'static';
    config.keyboard = false;
    this.StudyService = studyservice;
    this.MapService = mapservice;
    this.TravelTimeService = traveltimeservice;

    //this.print = function () {
      //window.print();
  //};
  }

  ngOnInit() {
    this.units = this.MapService.unitsOptions;
    this.abbrev = this.MapService.abbrevOptions;
    let reachList = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      reachList.shift(); //remove first element (one without results)

      this.checkUnits(reachList);
  }

  public onPrint() {
    // var div2Print=document.getElementById('print-content');
    // var newWin=window.open('','Print-Window');
    // newWin.document.open();
    // newWin.document.write('<html><body onload="window.print()">'+div2Print.innerHTML+'</body></html>');
    // newWin.document.close();
    // setTimeout(function(){newWin.close();},10);
    //window.print();
	// this.printElement(document.getElementById("print-content"));
	
	window.print();

  }
  
  private checkUnits(reaches) {
    if(!this.StudyService.isMetric()) {
      let tempreaches = [];

      for (var i = 0; i < reaches.length; i++) { 
          let newreach = reaches[i]; //copy jobson output for reach i to newreach

          newreach.parameters[1].value = (reaches[i].parameters[1].value * 35.314666212661).toUSGSvalue();     //real-time discharge from cms to cfs
          newreach.parameters[0].value = (reaches[i].parameters[0].value * 35.314666212661).toUSGSvalue();     //mean annual discharge from cms to cfs
          newreach.parameters[3].value = (reaches[i].parameters[3].value * 0.00000038610215855).toUSGSvalue(); //drainage area from square meters to square miles
          newreach.parameters[4].value = (reaches[i].parameters[4].value * 0.00062137).toUSGSvalue();              //length from meters to miles 
          if(newreach.parameters[7]) {  newreach.parameters[7].value = (reaches[i].parameters[7].value * 0.00062137).toUSGSvalue(); }             //cumulative length from meters to miles
          if(newreach.parameters[6]) {  newreach.parameters[6].value = (reaches[i].parameters[6].value * 0.0000022046).toUSGSvalue(); }            //spill mass from milligrams to pounds

          newreach.parameters[0].unit.unit = this.units.imperial['discharge']                    //mean annual discharge
          newreach.parameters[0].unit.abbr = this.abbrev.imperial['discharge']
          newreach.parameters[1].unit.unit = this.units.imperial['discharge']                    //real-time discharge
          newreach.parameters[1].unit.abbr = this.abbrev.imperial['discharge']
          newreach.parameters[2].unit.unit = this.units.imperial['slope']                        //slope
          newreach.parameters[2].unit.abbr = this.abbrev.imperial['slope']
          newreach.parameters[3].unit.unit = this.units.imperial['drainageArea']                 //drainage area
          newreach.parameters[3].unit.abbr = this.abbrev.imperial['drainageArea']
          newreach.parameters[4].unit.unit = this.units.imperial['distance']                     //reach length
          newreach.parameters[4].unit.abbr = this.abbrev.imperial['distance']
          if(newreach.parameters[7]) { newreach.parameters[7].unit.unit = this.units.imperial['distance'] }                  //cumulative length
          if(newreach.parameters[7]) { newreach.parameters[7].unit.abbr = this.abbrev.imperial['distance'] }
          if(newreach.parameters[6]) { newreach.parameters[6].unit.unit = this.units.imperial['concentration'] }               //spill mass
          if(newreach.parameters[6]) { newreach.parameters[6].unit.abbr = this.abbrev.imperial['concentration'] }

          newreach.result.equations.vmax.value = (reaches[i].result.equations.vmax.value * 3.2808399).toUSGSvalue(); //m/s to ft/s
          newreach.result.equations.v.value = (reaches[i].result.equations.v.value * 3.2808399).toUSGSvalue(); //m/s to ft/s

          newreach.result.equations.vmax.units = this.abbrev.imperial['velocity']
          newreach.result.equations.v.units = this.abbrev.imperial['velocity']
          
          tempreaches.push(newreach);
          console.log(i);
      }
      this.StudyService.selectedStudy.SpillMass = (this.StudyService.selectedStudy.SpillMass * 0.453592).toUSGSvalue();
      this.reaches = tempreaches;
      console.log(this.reaches);
    } else {
      this.reaches = reaches;
    } //keep existing metric units        
  }
  private printElement(elem) {
      var domClone = elem.cloneNode(true);
      
      var $printSection = document.getElementById("printSection");
      
      if (!$printSection) {
          var $print = document.createElement("div");
          $print.id = "printSection";
          document.body.appendChild($print);
      }
      
      $printSection.innerHTML = "";
      $printSection.appendChild(domClone);
      window.print();
  }
}
