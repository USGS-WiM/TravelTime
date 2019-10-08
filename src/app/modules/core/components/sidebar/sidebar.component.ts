import { Component} from '@angular/core';
import { StudyService } from '../../services/study.service';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import {MapService} from '../../services/map.services';
import { MatDialog, MatButtonToggleDefaultOptions } from '@angular/material';
import { Study } from '../../models/study';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import { JobsonsModalComponent } from '../jobsons/jobsons.component';
import { CommonModule } from "@angular/common"
import { Observable, of, Subject} from 'rxjs';
// import {MatExpansionModule} from '@angular/material/expansion';
declare let search_api: any;

@Component({
  selector: 'tot-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: []
})


export class SidebarComponent {

  private MapService: MapService;
  private StudyService: StudyService;
  public AvailableScenarioTypes
  public dialog: MatDialog;
  public Collapsed: boolean;
  public SelectedProcedureType: ProcedureType;
  public showSearchHelp: boolean;
  // set an api property value

  public get SelectedStudy() { return this.StudyService.selectedStudy }

  public get SelectedScenarioType() {
    return (this.StudyService && this.StudyService.selectedStudy ? this.StudyService.selectedStudy.MethodType : "")
  }

  public get ZoomLevel(): number{
    if (this.MapService.CurrentZoomLevel > 9 && this.toggleButton === true) {
      //this.StudyService.SetStep(1);
    }
    return this.MapService.CurrentZoomLevel;
  }

  public ishiddenBasemaps = true;
  public ishiddenOverlay = false;
  public get Step() {return this._step}
  public baselayers = [];
  public overlays = [];
  public model;
  private messager:ToastrService;
  private toggleButton = true;
  private _step: Number = 0;
  private previousProcedureType: ProcedureType = 1;

  constructor(mapservice: MapService, toastr: ToastrService, studyservice: StudyService, config: NgbModalConfig, private modalService: NgbModal) {
    this.messager = toastr;
    this.MapService = mapservice;
    this.StudyService = studyservice;
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {

    this.showSearchHelp = true;
    this.MapService.LayersControl.subscribe(data => {
      if (this.overlays.length > 0 || this.baselayers.length > 0) {
        this.overlays = []
        this.baselayers = []
      }
      this.overlays = data.overlays;
      this.baselayers = data.baseLayers;
    })

    search_api.create("searchBox", {
      "on_result": (o) => { //changed from function(o) to (o) =>
        this.MapService.setBounds([ // zoom to location
          [o.result.properties.LatMin, o.result.properties.LonMin],
          [o.result.properties.LatMax, o.result.properties.LonMax]
        ]);
      },
      "on_failure": (o) => {
        // alert user when the secondary geocoding service fails to return a result
        alert("Sorry, a location could not be found for '" + o.val() + "'");
      }
    })

    this.model = {
      baselayers: {},
      overlays: {}
    };

    this.SetProcedureType(1);

    this.StudyService.Step.subscribe(data => {
      this._step = data;
      if(data === 3 && this.SelectedProcedureType !== 2) {
        this.SetProcedureType(2)
      } else if(data === 4 && this.SelectedProcedureType !== 3) {
        this.SetProcedureType(3)
      }
    });
  }

  public SetBaselayer(LayerName: string) {
    this.MapService.SetBaselayer(LayerName)
  }

  public SetOverlay(LayerName: string) {
    this.MapService.SetOverlay(LayerName)
  }

  //#region "Methods"
  public SetScenarioType(ScenarioType:string) {
    this.StudyService.SetStep(1); //map click will result in POI selection
    if (ScenarioType = "response") {
      this.StudyService.selectedStudy = new Study(ScenarioType);
      this.MapService.isClickable = true;
    } else if (ScenarioType = "planning") {

    }
  }
  
  public SetProcedureType(pType:ProcedureType){
    if(!this.canUpdateProcedure(pType)) return;
    this.previousProcedureType = this.SelectedProcedureType;
    this.SelectedProcedureType = pType;

  }
  
  public ToggleSideBar(){
    if (this.Collapsed) this.Collapsed = false;
            else this.Collapsed = true; 
  }

  public toggleLayer(newVal: string) {
  }

  public open(){
    const modalRef = this.modalService.open(JobsonsModalComponent);
    modalRef.componentInstance.title = 'Jobsons';
  }
  //#endregion

  //#region "Private methods"
  private init(){
    this.SelectedProcedureType = ProcedureType.IDENTIFY; 
  }
  private canUpdateProcedure(pType: ProcedureType): boolean {
    try {               
        switch (pType) {
            case ProcedureType.MAPLAYERS:
              if(this.SelectedProcedureType === 0) {
                this.SetProcedureType(this.previousProcedureType);
                return false;
              }
                 return true;
            case ProcedureType.IDENTIFY:
                if(this.SelectedProcedureType === 1 && this.previousProcedureType !== 0) {
                  this.SetProcedureType(this.previousProcedureType);
                  return false;
                }
                return true;
            case ProcedureType.SCENARIO:
                //proceed only if Study Selected
                if(this._step < 3) {
                  throw new Error(this._step + " Can not proceed until study area options are selected.");
                } 
                if(this.SelectedProcedureType === 2) {
                  this.SetProcedureType(this.previousProcedureType);
                  return false;
                }
                return true;
            case ProcedureType.REPORT:
                if(!this.StudyService.selectedStudy || this._step !== 4) return;
                if(this.SelectedProcedureType === 3) {
                  this.SetProcedureType(this.previousProcedureType);
                  return false;
                }
                return true;
            default:
                return false;
        }//end switch          
    }
    catch (e) {
        this.sm(e.message,messageType.WARNING);         
        return false;
    }
  }
  private sm(msg: string, mType:string = messageType.INFO,title?:string,timeout?:number) {
    try {
      let options:Partial<IndividualConfig> = null;
      if(timeout) options ={timeOut:timeout};

      this.messager.show(msg,title,options, mType)
    }
    catch (e) {
    }
  }
  //#endregion
}

enum ProcedureType{
  MAPLAYERS = 0,
  IDENTIFY = 1,
  SCENARIO = 2,
  REPORT = 3
}
