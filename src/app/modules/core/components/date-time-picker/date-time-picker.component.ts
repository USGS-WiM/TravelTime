import { Component, OnInit, Input, forwardRef, ViewChild, AfterViewInit, Injector } from '@angular/core';
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

  //#region "UI acessors and declaration"
  @Input()
  dateString: string;
  @Input()
  inputDatetimeFormat = 'M/d/yyyy H:mm:ss';
  @Input()
  hourStep = 1;
  @Input()
  minuteStep = 15;
  @Input()
  secondStep = 30;
  @Input()
  seconds = true;
  @Input()
  disabled = false;
  @ViewChild(NgbDatepicker, { static: false })
  private dp: NgbDatepicker;

  @ViewChild(NgbPopover, { static: false })
  private popover: NgbPopover;
  //#endregion

  //#region "Declarations"
  private showTimePickerToggle = false;
  private datetime: DateTimeModel = new DateTimeModel();
  private firstTimeAssign = true;

  private onTouched: () => void = noop;
  private onChange: (_: any) => void = noop;

  public nwisdate: string;

  private ngControl: NgControl;
  private StudyService: StudyService;

  //#endregion

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

  onInputChange($event: any) {
    const value = $event.target.value;
    const dt = DateTimeModel.fromLocalString(value);

    if (dt) {
      this.datetime = dt;
      this.setDateStringModel();
    } else if (value.trim() === '') {
      this.datetime = new DateTimeModel();
      this.dateString = '';
      this.onChange(this.dateString);
    } else {
      this.onChange(value);
    }
  }

  onDateChange($event: any | NgbDateStruct) {
    if ($event.year) {
      $event = `${$event.year}-${$event.month}-${$event.day}`
    }
    const date = DateTimeModel.fromLocalString($event);

    if (!date) {
      this.dateString = this.dateString;
      return;
    }

    if (!this.datetime) {
      this.datetime = date;
    }

    this.datetime.year = date.year;
    this.datetime.month = date.month;
    this.datetime.day = date.day-1;

    if (this.dp) { this.dp.navigateTo({ year: this.datetime.year, month: this.datetime.month }) };
    if (this.datetime.day < 10) {
       var day = '0' + this.datetime.day;
    } else {
       var day = String (this.datetime.day);
    }

    console.log("Date changed");
    console.log(this.datetime);

    this.StudyService.selectedStudy.SpillDate =  (this.datetime.year + '-' + this.datetime.month + '-' + day);
    this.setDateStringModel();
  }

  onTimeChange(event: NgbTimeStruct) {
    this.datetime.hour = event.hour;
    this.datetime.minute = event.minute;
    this.datetime.second = event.second;
    console.log("Time changed")
    console.log(this.datetime);

    this.setDateStringModel();

  }

  setDateStringModel() {
    this.StudyService.setDate(this.datetime.toString());

    if (!this.firstTimeAssign) {
      this.onChange(this.datetime.toString());
      //this.sm('Access to real time flow is coming soon.......');
      this.nwisservices.getRealTimeFlow(this.datetime, this.nwisservices.gagesArray.value);
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

  //#endregion

}
