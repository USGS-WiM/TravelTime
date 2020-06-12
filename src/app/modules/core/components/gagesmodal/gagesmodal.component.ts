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
      console.log(data);
      data.forEach(r => {
        let gage = new gages(r);
        this.newSessionGages.push(gage);
      })
      this.gagesArray = this.newSessionGages;
    })
  }
}
