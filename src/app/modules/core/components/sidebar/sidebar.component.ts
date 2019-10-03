import { Component } from '@angular/core';
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
  public PanelData = [ 
    {id:0, header:'MAP LAYERS', content: '', expanded: false},
    {id:1, header:'IDENTIFY AREA', expanded: true},
    {id:2, header:'SCENARIOS', content: '', expanded: false, disabled: true},
    {id:3, header:'BUILD REPORT', content: '', expanded: false, disabled: true}
  ];
  public get SelectedStudy() {return this.StudyService.selectedStudy}
  public get SelectedScenarioType() {
    return (this.StudyService && this.StudyService.selectedStudy ? this.StudyService.selectedStudy.MethodType : "")
  }
  public get ZoomLevel(): number{
    if (this.MapService.CurrentZoomLevel > 9 && this.toggleButton === true) {
      this.toggleButton = false;
    }
    return this.MapService.CurrentZoomLevel;
  }

  public get canContinue() : boolean {
    if (this.StudyService && this.StudyService.selectedStudy && this.StudyService.selectedStudy.Reaches && this.StudyService.selectedStudy.Reaches.length > 0 && this.StudyService.step === 3) {
      this.SetScenarioType("Scenarios");
      return true;
    } else false;
  } 

  private messager:ToastrService;
  private toggleButton = true;

  public barButtonOptions_downstream: MatProgressButtonOptions;
  public barButtonOptions_upstream: MatProgressButtonOptions;
  public maplayerButton_points: MatProgressButtonOptions;
  public maplayerButton_natgeo: MatProgressButtonOptions;
  public maplayerButton_texas : MatProgressButtonOptions;
  public maplayerButton_topo: MatProgressButtonOptions;
  public maplayerButton_osm: MatProgressButtonOptions;
  public baselayers = [];
  public overlays = [];
  public model;

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
  }

  public SetBaselayer(LayerName: string) {
    this.MapService.SetBaselayer(LayerName)
  }

  public SetOverlay(LayerName: string) {
    this.MapService.SetOverlay(LayerName)
  }

  //#region "Methods"
  public SetScenarioType(ScenarioType:string) {
    this.StudyService.step = 1; //map click will result in POI selection
    if (ScenarioType = "response") {
      this.StudyService.selectedStudy = new Study(ScenarioType);
      this.MapService.isClickable = true;
    } else if (ScenarioType = "planning") {

    }
    console.log(ScenarioType)
  }
  
  public SetProcedureType(pType:ProcedureType){
    if(!this.canUpdateProcedure(pType)) return;
  
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
            return true;
            case ProcedureType.IDENTIFY:
                return true;
            case ProcedureType.SCENARIO:
                //proceed only if Study Selected
                if(!this.StudyService.selectedStudy || this.StudyService.step !== 3) {
                  throw new Error(this.StudyService.step + "Can not proceed until study area options are selected.");
                } 
                return true;
            case ProcedureType.REPORT:
                if(!this.SelectedStudy) {
                  this.PanelData[pType].expanded = false;
                  throw new Error("Can not proceed until study area options are selected.")
                }
                if(!this.SelectedScenarioType) {
                  this.PanelData[pType].expanded = false;
                  throw new Error("Can not proceed until Scenario options are selected.")
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
  MAPLAYERS=0,
  IDENTIFY =1,
  SCENARIO =2,
  REPORT =3
}
