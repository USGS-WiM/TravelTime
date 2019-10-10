import { Component, Output, AfterViewInit } from '@angular/core';
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
// import {MatExpansionModule} from '@angular/material/expansion';

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
  
  private _selectedproceduretype : ProcedureType;
  public get SelectedProcedureType() : ProcedureType {
    return this._selectedproceduretype;
  }
  
  public set SelectedProcedureType(v : ProcedureType) {
      this._selectedproceduretype = v;
  }
  
  public get SelectedStudy() {return this.StudyService.selectedStudy}
  public get SelectedScenarioType() {
    return (this.StudyService && this.StudyService.selectedStudy ? this.StudyService.selectedStudy.MethodType : "")
  }
  public get ZoomLevel(): number{
    if (this.MapService.CurrentZoomLevel > 9 && this.toggleButton === true) {
      this.StudyService.SetWorkFlow("reachedZoom", true);
    }
    return this.MapService.CurrentZoomLevel;
  }

  public ishiddenBasemaps = true;
  public ishiddenOverlay = false;

  public baselayers = [];
  public overlays = [];
  public model;

  private messager:ToastrService;
  private toggleButton = true;
  //private _step: Number = 0;
  private previousProcedureType: ProcedureType = 1;

  constructor(mapservice: MapService, toastr: ToastrService, studyservice: StudyService, config: NgbModalConfig, private modalService: NgbModal) {
    this.messager = toastr;
    this.MapService = mapservice;
    this.StudyService = studyservice;
    config.backdrop = 'static';
    config.keyboard = false;
   }

  ngOnInit() {
      this.MapService.LayersControl.subscribe(data => {
        if (this.overlays.length > 0 || this.baselayers.length > 0) {
          this.overlays = []
          this.baselayers = []
        }
        this.overlays = data.overlays;
        this.baselayers = data.baseLayers;
      })

      this.model = {
        baselayers: {},
        overlays: {}
      };

      this.SetProcedureType(1);

    this.StudyService.WorkFlowControl.subscribe(data => {
        if (data.hasReaches && this.SelectedProcedureType !== 2 && data.onInit) {
          this.SetProcedureType(2)
          this.StudyService.SetWorkFlow("onInit", false);
        } else if(data.totResults && this.SelectedProcedureType !== 3) {
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
  public GetClass(pType: ProcedureType) {
    if(this.SelectedProcedureType === pType) {
      return "list-group-item-active";
    } else return "list-group-item";
  }

  public SetScenarioType(ScenarioType:string) {
    this.StudyService.SetWorkFlow("hasMethod", true); //map click will result in POI selection
    this.StudyService.selectedStudy = new Study(ScenarioType);
    this.MapService.isClickable = true;
  }
  
  public SetProcedureType(pType:ProcedureType){
    if(!this.canUpdateProcedure(pType)) {
      if(this.StudyService.GetWorkFlow("hasReaches") || this.StudyService.GetWorkFlow("totResults")) {
        this.SelectedProcedureType = this.previousProcedureType;
        console.log ("Selected = " + this.SelectedProcedureType + " Previous = " + this.previousProcedureType);
      }
      return;
    }
    if(this.SelectedProcedureType !== 0) {
      this.previousProcedureType = this.SelectedProcedureType;
    }    
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
                if(this.SelectedProcedureType === 1) {
                  this.SetProcedureType(this.previousProcedureType);
                  return false;
                }
                return true;
            case ProcedureType.SCENARIO:
                //proceed only if Study Selected
                if(!this.StudyService.GetWorkFlow("hasReaches")) {throw new Error("Can not proceed until study area options are selected.");} 
                if(this.SelectedProcedureType === 2) { return false; }
                return true;
            case ProcedureType.REPORT:
                if(!this.StudyService.selectedStudy || !this.StudyService.GetWorkFlow("totResults")) return;
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
      setTimeout(() =>
        this.messager.show(msg,title,options, mType))
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
