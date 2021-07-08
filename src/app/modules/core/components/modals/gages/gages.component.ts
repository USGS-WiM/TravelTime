import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MapService } from '../../../services/map.service';
import { NWISService } from '../../../services/nwisservices.service';
import { gages } from '../../../models/gages';
import { StudyService } from '../../../services/study.service'

@Component({
  selector: 'app-gages',
  templateUrl: './gages.component.html',
  styleUrls: ['./gages.component.scss']
})
export class GagesComponent implements OnInit {
  public gagesArray: Array<gages> = [];
  public newSessionGages: Array<gages> = [];
  public units: any = {discharge: "", drnarea: ""};

  constructor(public activeModal: NgbActiveModal, public MapService: MapService, public NWISService: NWISService, public StudyService: StudyService) {
    this.MapService = MapService;
    this.NWISService = NWISService;
    this.StudyService = StudyService;
  }

  ngOnInit() {
    this.NWISService.gagesArray.subscribe(data => {
      data.forEach(r => {
        let gage = new gages(r);
        this.newSessionGages.push(gage);
      })
      this.gagesArray = this.newSessionGages;

      //Outputs console error, we need to move this part to fill in gage data before we open modal
      this.gagesArray.forEach(r => {
        var siteid = r.identifier.split('-')[1];
        this.NWISService.getStatus(siteid).subscribe(result => {
          console.log('getting status');
          if (result) {
            r.status = "Inactive";
          } else {
            r.status = "Active";
          }
          console.log ('status before error')
        }), error => {
          r.status = "Inactive";
        }
        if (r.status !== "Active") {
          r.status = "Inactive";
        }
      })      
    })
    if(this.StudyService.isMetric()) {
      this.units.discharge = 'cms';
      this.units.drnarea = 'km';
    } else {
      this.units.discharge = 'cfs';
      this.units.drnarea = 'mi';
    }
  }
}
