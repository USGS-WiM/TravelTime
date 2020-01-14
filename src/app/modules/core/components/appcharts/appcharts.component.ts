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
  reaches: reach[];
  private subscription: Subscription;
  public gradient;

  @ViewChild(BaseChartDirective,{ static: false }) chart: BaseChartDirective;

  @ViewChild("myCanvas", { static: false }) canvas: ElementRef;


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

    public getConcentration(o) {
    if (this.lineChartData.some(e => e.label === o.name)) { }
    else {
      let l = this.lineChartData.length;
      let myarray = [];
      for (let j = 0; j < l * 3; j++) {
        myarray.push(0);
      }
      myarray.push(o.result["tracer_Response"].leadingEdge.MostProbable.concentration);
      myarray.push(o.result["tracer_Response"].peakConcentration.MostProbable.concentration);
      myarray.push(o.result["tracer_Response"].trailingEdge.MostProbable.concentration);
      let myobj = { data: myarray, label: o.name }
      this.lineChartData.push(myobj);
    }
  }
 
  public ExecuteSelected(s: number[]) {
    while (this.lineChartData.length > 0) {
      this.lineChartData.pop();
    }

    while (this.lineChartLabels.length > 0) {
      this.lineChartLabels.pop();
    }

    //ok if charts array is more then two, charts does exist, so they can be updated;
    s.forEach((i) => {
      this.getTime(this.output$[i]);
      this.getConcentration(this.output$[i]);
      if (s.length > 2) {
        this.gradient = this.canvas.nativeElement.getContext('2d').createLinearGradient(0, 0, 0, 200);
        this.gradient.addColorStop(0, 'green');
        this.gradient.addColorStop(1, 'white');
        console.log(this.chart)
        this.chart.update();
        this.chart.updateColors();

      } else { }
    })
  }



  public getTime(o) {
    if (this.lineChartData.some(e => e.label === o.name)) { }
    else {
      this.lineChartLabels.push(o.result["tracer_Response"].leadingEdge.MostProbable.timeLapse);
      this.lineChartLabels.push(o.result["tracer_Response"].peakConcentration.MostProbable.timeLapse);
      this.lineChartLabels.push(o.result["tracer_Response"].trailingEdge.MostProbable.timeLapse);
    }
  }

  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    legend: { position: 'left' },
    title: {
      text: 'Time of travel downstream',
      display: true
    },
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
      backgroundColor: this.gradient,
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(51,102,102,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { 
      backgroundColor: 'rgba(51,204,204,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(51,255,255,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(51,102,255,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(51,153,255,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(51,204,255,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(51,255,255,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(102,255,204,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(102,255,255,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  ngOnInit() {


    this.subscription = this.ChartService.return$.subscribe(myvals => {
       this.ExecuteSelected(myvals);
    });

  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    //console.log(event, active);
  }
}
