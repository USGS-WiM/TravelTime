import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { StudyService } from '../../services/study.service';

@Component({
  selector: 'app-apptools',
  templateUrl: './apptools.component.html',
  styleUrls: ['./apptools.component.css']
})

export class ApptoolsComponent implements OnInit {

  public formGroup: FormGroup;
  public StudyService: StudyService;
  public distance: Number;
  public logthis(e) {
    console.log(e);
  }
  public units = ["metric", "imperial"];

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, public studyservice: StudyService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.StudyService = studyservice;
    this.distance = this.StudyService.distance;

  }

  ngOnInit(): any {

    this.formGroup = new FormGroup({
    activeEndDate: new FormControl(new Date(), { validators: [Validators.required] })
    }, { updateOn: 'change' });
  }

}
