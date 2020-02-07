import { StudyService } from '../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';
import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { ChartsService } from '../../services/charts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-appcharts',
  templateUrl: './appcharts.component.html',
  styleUrls: ['./appcharts.component.scss']
})

export class AppchartsComponent implements OnInit {
  private ChartService: ChartsService;
  private StudyService: StudyService;
  private messanger: ToastrService;
  private subscription: Subscription;

  //most probable
  private maxMostProbableY;
  private maxMostProbableX;
  private minMostProbableX;

  //maximum probable
  private maxMaxProbableY;
  private maxMaxProbableX;
  private minMaxProbableX;

  private maxTimeLabels = [];
  private maxConcentration = [];

  private mostTimeLabels = [];
  private mostConcentration =[];

  public buttonName = "MaximumProbable";
  public showMost = true;
  public showMax = false;

  public toggleProbable() {
    if (this.buttonName == "MostProbable") {
		this.buttonName = "MaximumProbable";
		this.showMost = true;
		this.showMax = false;
    } else {
		this.buttonName = "MostProbable";
		this.showMost = false;
		this.showMax = true;
    }

	// Reverse the data display
	$("#footerData").toggleClass("reverse");

  }

  reaches: reach[];


  public maxLineChartLabels: Array<any> = [];
  public maxLineChartData: ChartDataSets[] = [];

  public mostLineChartLabels: Array<any> = [];
  public mostLineChartData: ChartDataSets[] = [];


  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];


  @ViewChild(BaseChartDirective,{ static: false }) chart: BaseChartDirective;
  constructor(toastr: ToastrService, studyservice: StudyService, chartservice: ChartsService) {
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.ChartService = chartservice;
  }
  //Get time all, subscribe to selected row and plot selected one;
  ngOnInit() {
    this.getAllMostProbable();
    this.generateData();
  }

  public generateData() {
    let c = 0;
    this.output$.forEach((o => {
      let myarray = [];
      for (let i = 0; i < this.output$.length * 3; i++) {
        myarray.push(null);
      }
      myarray[c] = this.mostConcentration[c];
      myarray[c + 1] = this.mostConcentration[c + 1];
      myarray[c + 2] = this.mostConcentration[c + 2];
      let myobj = { data: myarray, label: o.name }
      this.mostLineChartData.push(myobj);
      c += 3;
    }))

    //for maxConcentration
    c = 0;
    this.output$.forEach((o => {
      let myarray = [];
      for (let i = 0; i < this.output$.length * 3; i++) {
        myarray.push(null);
      }
      myarray[c] = this.maxConcentration[c];
      myarray[c + 1] = this.maxConcentration[c + 1];
      myarray[c + 2] = this.maxConcentration[c + 2];
      let myobj = { data: myarray, label: o.name }
      this.maxLineChartData.push(myobj);
      c += 3;
    }))
  }

  public get output$() {
    if (this.StudyService.GetWorkFlow('totResults')) {
      this.reaches = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      this.reaches.shift(); //remove first element (one without results)
      return (this.reaches);
    } else {
      return;
    }
  }

  public getAllMostProbable() {
    console.log(this.output$);
    this.output$.forEach((o => {
      this.mostTimeLabels.push(o.result["tracer_Response"].leadingEdge.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
      this.mostTimeLabels.push(o.result["tracer_Response"].peakConcentration.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
      this.mostTimeLabels.push(o.result["tracer_Response"].trailingEdge.MostProbable.date);
      this.mostConcentration.push(o.result["tracer_Response"].trailingEdge.MostProbable.concentration);

      this.maxTimeLabels.push(o.result["tracer_Response"].leadingEdge.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].leadingEdge.MaximumProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].peakConcentration.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].peakConcentration.MaximumProbable.concentration);
      this.maxTimeLabels.push(o.result["tracer_Response"].trailingEdge.MaximumProbable.date);
      this.maxConcentration.push(o.result["tracer_Response"].trailingEdge.MaximumProbable.concentration);
    }));
    
    for (var i = 0; i < this.mostTimeLabels.length; i++) {
      this.mostLineChartLabels.push(this.mostTimeLabels[i]);
      this.maxLineChartLabels.push(this.maxTimeLabels[i]);
    }

    this.mostTimeLabels.sort(function (a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    });

    this.maxTimeLabels.sort(function (a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    });

    this.maxMostProbableX = this.mostTimeLabels[this.mostTimeLabels.length - 1];
    this.minMostProbableX = this.mostTimeLabels[0];
    this.maxMostProbableY = Math.max.apply(Math, this.mostConcentration);

    this.maxMaxProbableX = this.maxTimeLabels[this.maxTimeLabels.length - 1];
    this.minMaxProbableX = this.maxTimeLabels[0];
    this.maxMaxProbableY = Math.max.apply(Math, this.maxConcentration);
  }

  public mostLineChartOptions: any = {
    responsive: true,
    elements: { line: { tension: 0 } },
    legend: { position: 'left' },
    title: {
      text: 'Most probable Time of Travel',
      display: true
    },
    scales: {
      yAxes: [{
        ticks: {
          max: this.maxMostProbableY,
          min: 0,
        }
      }],
      xAxes: [{
        type: 'time',
        ticks: {
          max: this.maxMostProbableX,
          min: (this.minMostProbableX - 5),
          unit: 'minute',
          unitStepSize: 10,
          displayFormats: {
            'second': 'HH:mm:ss',
            'minute': 'HH:mm:ss',
            'hour': 'HH:mm',
          },
        },
      }],
    },
  };


  public maxLineChartOptions: any = {
    responsive: true,
    elements: { line: { tension: 0 } },
    legend: { position: 'left' },
    title: {
      text: 'Maximum probable Time of Travel',
      display: true
    },
    scales: {
      yAxes: [{
        ticks: {
          max: this.maxMaxProbableY,
          min: 0,
        }
      }],
      xAxes: [{
        type: 'time',
        ticks: {
          max: this.maxMaxProbableX,
          min: (this.minMaxProbableX - 5),
          unit: 'minute',
          unitStepSize: 10,
          displayFormats: {
            'second': 'HH:mm:ss',
            'minute': 'HH:mm:ss',
            'hour': 'HH:mm',
          },
        },
      }],
    },
  };

  public lineChartColors: Color[] = [];
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
}
