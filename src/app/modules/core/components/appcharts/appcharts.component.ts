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
  styleUrls: ['./appcharts.component.css']
})

export class AppchartsComponent implements OnInit {
  private ChartService: ChartsService;
  private StudyService: StudyService;
  private messanger: ToastrService;
  private subscription: Subscription;
  private myTime = [];
  private myTimeLabels = [];
  reaches: reach[];

  public lineChartLabels: Array<any> = [];
  public lineChartData: ChartDataSets[] = [];
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

    //get time stamp, lowest to highest
    //add these time stamps
    console.log(this.output$);
    this.getTimeall();
    this.getTimeLabels();
    this.subscription = this.ChartService.return$.subscribe(myvals => {
      this.ExecuteSelected(myvals);
    });
  }

  public getTimeLabels() {
    this.output$.forEach((o => {
      this.myTimeLabels.push(o.result["tracer_Response"].leadingEdge.MostProbable.date);
      this.myTimeLabels.push(o.result["tracer_Response"].peakConcentration.MostProbable.date);
      this.myTimeLabels.push(o.result["tracer_Response"].trailingEdge.MostProbable.date);
    }));
    //this.lineChartLabels = this.myTimeLabels;
    console.log(this.lineChartLabels);
  }
  public getTimeall() {
    let i = 0;
    let leadEd: Number;
    let peakEd: Number;
    let trailEd: Number;
    this.output$.forEach((o => {
      leadEd = this.toMinute(o.result["tracer_Response"].leadingEdge.MostProbable.cumTime);
      this.myTime.push([i, leadEd]);
      i += 1;
      peakEd = this.toMinute(o.result["tracer_Response"].peakConcentration.MostProbable.cumTime);
      this.myTime.push([i, peakEd]);
      i += 1;
      trailEd = this.toMinute(o.result["tracer_Response"].trailingEdge.MostProbable.cumTime);
      this.myTime.push([i, trailEd]);
      i += 1;
    }));

    function compareSecondColumn(a, b) { //sort by second column
      if (a[1] === b[1]) { //to sort by first column, change index to 1;
        return 0;
      }
      else {
        return (a[1] < b[1]) ? -1 : 1;
      }
    }
    this.myTime = this.myTime.sort(compareSecondColumn);
    for (let i = 0; i < this.myTime.length; i++) {
      this.lineChartLabels.push(this.myTime[i][1]);
    }
  }


  public ExecuteSelected(s: number[]) {
    while (this.lineChartData.length > 0) {
      this.lineChartData.pop();
    }
    let j = 0;
    s.forEach((i) => {      
      this.getConcentrationAll(j, this.output$[i]);
      j += 3;
    })
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
  public getAllIndexes(arr, val) {
    var indexes = [], i;
    for (i = 0; i < arr.length; i++)
      if (arr[i] > val)
        indexes.push(i);
    return indexes;
  }
  public Interpolate(myarray: any[]) {
    let b;//intercept
    let difix;
    let dift; //difference in time
    let difc; //difference in concenttration
    let index = this.getAllIndexes(myarray, 0);
    difc = myarray[index[1]] - myarray[index[0]];
    dift = this.lineChartLabels[index[1]].valueOf() - this.lineChartLabels[index[0]].valueOf();
    b = myarray[index[0]] - (difc / dift) * this.lineChartLabels[index[0]].valueOf() //find intercept;
    difix = index[1] - index[0];
    if (difix > 1) {
      let c = 0;
      let t = false;
      for (var i = 0; i < myarray.length; i++) {

        if (myarray[i] > 0) {
          c += 1;
        }

        if (c == 2) {
          t = false;
        }

        if (t) {
          myarray[i] = (difc / dift) * this.lineChartLabels[i].valueOf() + b
        }

        if (myarray[i] > 0 && t == false) {
          t = true;
        }
      }
    }
    return myarray;
  }
  public toMinute(t) {
    let myString = t;
    var nameArr = myString.split(',');     //split string, only hours and only minutes
    let time;
    if (nameArr.length < 2) {    //if length of array is one, it is minutes only
      time = Number(nameArr[0].replace(/\D/g, ''));
    } else {
      let minutes = Number(nameArr[1].replace(/\D/g, ''));
      let hours = Number(nameArr[0].replace(/\D/g, ''));
      time = minutes + hours * 60;
    }
    return (time);
  }
  public getTime(o) {
    if (this.lineChartData.some(e => e.label === o.name)) { }
    else {

      let led = Number(this.toMinute(o.result["tracer_Response"].leadingEdge.MostProbable.cumTime));
      let ped = Number(this.toMinute(o.result["tracer_Response"].peakConcentration.MostProbable.cumTime));
      let ted = Number(this.toMinute(o.result["tracer_Response"].trailingEdge.MostProbable.cumTime));

      this.lineChartLabels.push(led);
      this.lineChartLabels.push(ped);
      this.lineChartLabels.push(ted);
    }
  }
  public getConcentrationAll(c, o) {
    if (this.lineChartData.some(e => e.label === o.name)) { }
    else {
      let myarray = [];
      for (let i = 0; i < this.output$.length * 3; i++) {
        myarray.push(0);
      }

      let leadIndex = this.myTime.findIndex(function ([a, b]) {
        return a == c;
      })
      myarray[leadIndex] = (o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
      c = c + 1;

      let peakIndex = this.myTime.findIndex(function ([a, b]) {
        return a == c;
      })
      myarray[peakIndex] = (o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
      c = c + 1;

      let trainIndex = this.myTime.findIndex(function ([a, b]) {
        return a == c;
      })
      myarray[trainIndex] = (o.result["tracer_Response"].trailingEdge.MostProbable.concentration);

      myarray = this.Interpolate(myarray);

      let myobj = { data: myarray, label: o.name }

      this.lineChartData.push(myobj);
    }
  }
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,

    legend: { position: 'left' },
    title: {
      text: 'Time of travel downstream',
      display: true
    },
    elements: { line: { tension: 0 } },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
          }
        } //add additional axis
        /*,
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
          }
        }*/
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(51,102,102,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
}
