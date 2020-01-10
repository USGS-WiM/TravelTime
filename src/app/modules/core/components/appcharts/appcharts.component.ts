//import { Component, OnInit } from '@angular/core';
//import { ChartDataSets, ChartOptions } from 'chart.js';
//import { Color, BaseChartDirective, Label } from 'ng2-charts';
//import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { StudyService } from '../../services/study.service';
import { MapService } from '../../services/map.services';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { reach } from '../../models/reach';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { isInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
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
  reaches: reach[];
  private subscription: Subscription;

  constructor(toastr: ToastrService, studyservice: StudyService, chartservice: ChartsService) {
    this.messanger = toastr;
    this.StudyService = studyservice;
    this.ChartService = chartservice;
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

  public lineChartLabels: Label[] = [];

  public lineChartData: ChartDataSets[] = [
  ];

  public getConcentrationAll(c, o) {
    let myarray = [];
    for (let i = 0; i < this.output$.length * 3; i++) {
      myarray.push(0);
    }
    myarray[c] = (o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
    c = c+ 1;
    myarray[c] = (o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
    c = c + 1;
    myarray[c] = (o.result["tracer_Response"].trailingEdge.MostProbable.concentration);
    let myobj = { data: myarray, label: "reach" }
    this.lineChartData.push(myobj);
  }

  public getConcentration(o) {
    let i = this.lineChartData.length;
    let myarray = [];
    for (let j = 0; j < i*3; j++) {
      myarray.push(0);
    }
    myarray.push(o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
    myarray.push(o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
    myarray.push(o.result["tracer_Response"].trailingEdge.MostProbable.concentration);
    let myobj = { data: myarray, label: "reach" }
    this.lineChartData.push(myobj);
  }
 
  public ExecuteAll() {
    let j = 0;
    this.output$.forEach((o) => {
      this.getTime(o);
      this.getConcentrationAll(j, o);
      j += 3;
    })
  }

  public ExecuteSelected(s: number[]) {
    while (this.lineChartData.length > 0) {
      this.lineChartData.pop();
    }

    while (this.lineChartLabels.length > 0) {
      this.lineChartLabels.pop();
    }

    s.forEach((i) => {
      this.getTime(this.output$[i]);
      this.getConcentration(this.output$[i]);
    })
  }

  public getTime(o) {
    this.lineChartLabels.push(o.result["tracer_Response"].leadingEdge.MostProbable.timeLapse);
    this.lineChartLabels.push(o.result["tracer_Response"].peakConcentration.MostProbable.timeLapse);
    this.lineChartLabels.push(o.result["tracer_Response"].trailingEdge.MostProbable.timeLapse);
  }

  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
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
        }
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
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  ngOnInit() {
    this.subscription = this.ChartService.return$.subscribe(myvals => {
       this.ExecuteSelected(myvals);
    });

    //this.ExecuteAll(); 
  }

  public randomize(): void {
    for (let i = 0; i < this.lineChartData.length; i++) {
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        this.lineChartData[i].data[j] = this.generateNumber(i);
      }
    }
    this.chart.update();
  }

  private generateNumber(i: number) {
    return Math.floor((Math.random() * (i < 2 ? 100 : 1000)) + 1);
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public hideOne() {
    const isHidden = this.chart.isDatasetHidden(1);
    this.chart.hideDataset(1, !isHidden);
  }

  public pushOne() {
    this.lineChartData.forEach((x, i) => {
      const num = this.generateNumber(i);
      const data: number[] = x.data as number[];
      data.push(num);
    });
    this.lineChartLabels.push(`Label ${this.lineChartLabels.length}`);
  }

  public changeColor() {
    this.lineChartColors[2].borderColor = 'green';
    this.lineChartColors[2].backgroundColor = `rgba(0, 255, 0, 0.3)`;
  }

  public changeLabel() {
    this.lineChartLabels[2] = ['1st Line', '2nd Line'];
    // this.chart.update();
  }

}
