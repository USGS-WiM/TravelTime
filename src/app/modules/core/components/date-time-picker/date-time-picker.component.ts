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
  private isOpen = false;
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
    var date = new Date;
    this.datetime.day = date.getDate();
    this.datetime.month = date.getMonth() + 1;
    this.datetime.year = date.getFullYear();
    this.datetime.hour = date.getHours();
    this.datetime.minute = date.getMinutes();
    this.datetime.second = date.getSeconds();
    this.dateString = this.datetime.toString();
  }

  //#region "Methods"
  ngAfterViewInit(): void {
    this.popover.hidden.subscribe($event => {
      this.showTimePickerToggle = false;
    });
  }

  writeValue(newModel: string) {
    if (newModel) {
      this.datetime = Object.assign(this.datetime, DateTimeModel.fromLocalString(newModel));
      this.dateString = newModel;
      this.setDateStringModel();
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

  setDateStringModel() {
    this.dateString = this.datetime.toString();
    this.StudyService.setDate(this.dateString);

    if (!this.firstTimeAssign) {
      this.onChange(this.dateString);
      let starttime = this.dateString;
      let endtime = this.datetime;
      endtime.minute = (endtime.minute + 15);
      if (endtime.minute > 60) {
        endtime.hour = endtime.hour + 1;
        endtime.minute = endtime.minute - 59;
      }
      //this.mapservice.getRealTimeFlow(starttime, endtime.toString(), this.mapservice.gagesArray.value);
    } else {
      // Skip very first assignment to null done by Angular
      if (this.dateString !== null) {
        this.firstTimeAssign = false;
      }
    }
  }

  inputBlur($event) {
    this.onTouched();
  }

  onDateChange($event: any | NgbDateStruct) {
    if(this.check4FutureDate($event, 1)) {
      this.datetime.day = $event.day;
      this.datetime.month = $event.month;
      this.datetime.year = $event.year;
      this.StudyService.setDate(this.datetime.toString());
      this.dateString = this.datetime.toString();
    } else {
      alert("Selected date occurs in the future, current date/time will be used.")
    }
  }

  onTimeChange ($event: any | NgbDateStruct) {
    if(this.check4FutureDate($event, 2)) {
      this.datetime.hour = $event.hour;
      this.datetime.minute = $event.minute;
      this.datetime.second = $event.second;
      this.StudyService.setDate(this.datetime.toString());
      this.dateString = this.datetime.toString();
    } else {
      alert("Selected time occurs in the future, current date/time will be used.")
    }
  }

  onInputChange($event) {
    if(this.check4FutureDate($event, 4)) {
      this.writeValue($event);
    } else {
      alert("Selected date/time occurs in the future, current date/time will be used.")
    }
  }
  
  postDate() {
    if(!this.isOpen) { //calendar popup is active, wait for new date/time
      this.isOpen = true;
    } else { //calendar popup is closing, calls to nwis with new date/time required on close
      this.isOpen = false;
      this.nwisservices.getDateSpecificFlow(this.datetime, this.nwisservices.gagesArray.value);
    }
  }

  check4FutureDate(DM, type) { //1=date, 2=time, 3=all, 4=string input (example: "7/14/2021 16:14:38")
    var currentDT = new Date;
    var year = currentDT.getFullYear;
    var month = currentDT.getMonth;
    var date = currentDT.getDate;    
    var hour = currentDT.getHours;
    var minutes = currentDT.getMinutes;

    if(type == 1){
      var selectedDate = new Date(DM.year, DM.month - 1, DM.day, 0, 0, 0, 0)
    } else if(type == 2) {
      var selectedDate = new Date(this.datetime.year, this.datetime.month - 1, this.datetime.day, 0, 0, 0, 0);
    } else if(type == 3) {
      var selectedDate = new Date(DM.year, DM.month - 1, DM.day, DM.hour, DM.minute, DM.seconds, 0);
    } else if(type == 4) {
      var splitDate = DM.split(" ");
      var dt = splitDate[0].split("/");
      var tm = splitDate[1].split(":");      
      var selectedDate = new Date(dt[2], dt[0] - 1, dt[1], tm[3], tm[4], tm[5], 0);
    }

    if(selectedDate > currentDT) {
      return false;
    } else {
      return true;
    }
    
  }
}

