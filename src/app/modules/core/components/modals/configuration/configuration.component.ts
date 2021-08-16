import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { StudyService } from '../../../services/study.service';
import { UnitsArray } from '../../../services/study.service';
import '../../../../../shared/extensions/number.toUSGSValue';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})

export class ConfigurationComponent implements OnInit {

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, public studyservice: StudyService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.StudyService = studyservice;
    this.distance = this.StudyService.distance;
    this.units = this.StudyService.units;
  }
  ngOnInit(): any {
    this.formGroup = new FormGroup({
      activeEndDate: new FormControl(new Date(), { validators: [Validators.required] })
    }, { updateOn: 'change' });
    this.unit.push(' (kilometers)');
    this.unit.push(' (miles)');
  }

  //#region "Declarations"
  public formGroup: FormGroup;
  public StudyService: StudyService;
  public distance: number;
  public units: UnitsArray[];
  public unit = [];
  //#endregion

  //#region "Methods"
  public setUnits(indx) {
    let j = 0;
    this.distance = this.StudyService.distance;
    const initialDist = this.distance; // initial distance no reference
    this.units.forEach(i => {
      if (indx === j) {
        i.isactive = true;
      } else {
        i.isactive = false;
      }
      if (i.isactive) {
        if (i.name === 'imperial') {
          this.distance = initialDist * 0.621371; // to miles
          this.StudyService.setUnits(i.name);
        } else {
          this.distance = initialDist * 1.60934; // to km
          this.StudyService.setUnits(i.name);
        }
      } else {}
      this.distance = this.distance.toUSGSvalue();
      this.StudyService.distance = this.distance;
      j += 1;
    })
  }

  //#endregion

}
