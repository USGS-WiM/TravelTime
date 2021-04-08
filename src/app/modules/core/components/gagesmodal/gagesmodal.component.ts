import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MapService } from '../../services/map.service';
import { NWISService } from '../../services/nwisservices.service';
import { gages } from '../../models/gages';
@Component({
  selector: 'app-gagesmodal',
  templateUrl: './gagesmodal.component.html',
  styleUrls: ['./gagesmodal.component.scss']
})
export class GagesmodalComponent implements OnInit {
  public gagesArray: Array<gages> = [];
  public newSessionGages: Array<gages> = [];
  constructor(public activeModal: NgbActiveModal, public MapService: MapService, public NWISService: NWISService) {
    this.MapService = MapService;
    this.NWISService = NWISService;
  }

  ngOnInit() {

    this.NWISService.gagesArray.subscribe(data => {
      console.log(data);
      data.forEach(r => {
        let gage = new gages(r);
        this.newSessionGages.push(gage);
      })
      this.gagesArray = this.newSessionGages;
      this.gagesArray.forEach(r => {
        var siteid = r.identifier.split('-')[1];
        this.NWISService.getStatus(siteid).subscribe(data => {
          if (data) {
            r.status = "Inactive";
          } else {
            r.status = "Active";
          }
        }), error => {
          r.status = "Inactive";
        }
        if (r.status !== "Active") {
          r.status = "Inactive";
        }
      })
      
    })
  }
}
