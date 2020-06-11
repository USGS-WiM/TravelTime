import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MapService } from '../../services/map.services';
import { gages } from '../../models/gages';
@Component({
  selector: 'app-gagesmodal',
  templateUrl: './gagesmodal.component.html',
  styleUrls: ['./gagesmodal.component.scss']
})
export class GagesmodalComponent implements OnInit {
  public gagesArray: Array<gages> = [];
  public newSessionGages: Array<gages> = [];
  constructor(public activeModal: NgbActiveModal, public MapService: MapService) {
    this.MapService = MapService;
  }

  ngOnInit() {

    this.MapService.gagesArray.subscribe(data => {
      data.forEach(r => {
        let gage = new gages(r.properties);
        this.newSessionGages.push(gage);
      })
    })

    for (var i = 0; i < this.MapService.gages.length; i++) {
      if (this.MapService.gages[i].value.timeSeries.length > 0) {
        this.newSessionGages[i].value = this.MapService.gages[i].value.timeSeries[0].values[0].value[0].value;
        let date = new Date (this.MapService.gages[i].value.timeSeries[0].values[0].value[0].dateTime);
        this.newSessionGages[i].record = date;
        this.gagesArray.push(this.newSessionGages[i]);
      } else {
        this.gagesArray.push(this.newSessionGages[i]);
      }
    }
  }
}
