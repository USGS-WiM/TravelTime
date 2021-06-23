import { Component, OnInit, Input, forwardRef, ViewChild, AfterViewInit, Injector, EventEmitter, Output } from '@angular/core';
import { NgbTimeStruct, NgbDateStruct, NgbPopoverConfig, NgbPopover, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateTimeModel } from './date-time.model';
import { noop } from 'rxjs';
import { StudyService } from 'src/app/modules/core/services/study.service';
import { MapService } from '../../services/map.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../../shared/messageType';
import { NWISService } from '../../services/nwisservices.service';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})

export class DateTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  private messager: ToastrService;
  model: NgbDateStruct;
  time: NgbTimeStruct = { hour: 13, minute: 30, second: 30 };
  seconds = true;
  private StudyService: StudyService;
  private ngControl: NgControl;
  private datetime: DateTimeModel = new DateTimeModel();
  private firstTimeAssign = true;
  private onTouched: () => void = noop;
  private onChange: (_: any) => void = noop;
  @Input()
  dateString: string = (new Date).toString();
  private showTimePickerToggle = false;
  @ViewChild(NgbPopover, { static: false })
  private popover: NgbPopover;
  @Input()
  disabled = false;
  @Input()
  inputDatetimeFormat = 'M/d/yyyy H:mm:ss';
  @Input()
  hourStep = 1;
  @Input()
  minuteStep = 15;
  @Input()
  secondStep = 30;

  constructor(toastr: ToastrService, private config: NgbPopoverConfig, private inj: Injector, private studyservice: StudyService, private mapservice: MapService, private nwisservices: NWISService) {
    this.nwisservices = nwisservices;
    this.messager = toastr;
    config.autoClose = 'outside';
    config.placement = 'left-top';
    this.StudyService = studyservice;
    this.mapservice = mapservice;
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }

  ngOnInit(): void {
    this.ngControl = this.inj.get(NgControl);
  }

  //#region "Methods"
  ngAfterViewInit(): void {
    this.popover.hidden.subscribe($event => {
      this.showTimePickerToggle = false;
    });
  }

  writeValue(newModel: string) {
    if (newModel) {
      console.log(newModel);
      this.datetime = Object.assign(this.datetime, DateTimeModel.fromLocalString(newModel));
      this.dateString = newModel;
      console.log("changed actual date time of calendar");
      console.log(this.datetime);
    } else {
      this.datetime = new DateTimeModel();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDateTimeState($event) {
    this.showTimePickerToggle = !this.showTimePickerToggle;
    $event.stopPropagation();
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  inputBlur($event) {
    this.onTouched();
  }

  onDateChange($event: any | NgbDateStruct) {
    this.datetime.day = $event.day;
    this.datetime.month = $event.month;
    this.datetime.year = $event.year;
    this.StudyService.setDate(this.datetime.toString());
    this.dateString = this.datetime.toString();
  }

  onTimeChange ($event: any | NgbDateStruct) {
    this.datetime.hour = $event.hour;
    this.datetime.minute = $event.minute;
    this.datetime.second = $event.second;
    this.StudyService.setDate(this.datetime.toString());
    this.dateString = this.datetime.toString();
  }

  onInputChange($event) {
    console.log(this.dateString);
    this.writeValue($event);
  }


  setDateStringModel() {
    //this.StudyService.setDate(this.datetime.toString());
    if (!this.firstTimeAssign) {
      //this.onChange(this.datetime.toString());
      //this.sm('Access to real time flow is coming soon.......');
      console.log(this.datetime.toString());
      console.log("getting real time flow");
      this.nwisservices.getRealTimeFlow(this.datetime, this.nwisservices.gagesArray.value);
    } else {
      // Skip very first assignment to null done by Angular
      if (this.dateString !== null) {
        this.firstTimeAssign = false;
      }
    }
  }

}

