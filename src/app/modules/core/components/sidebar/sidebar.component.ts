import { Component } from '@angular/core';
import { StudyAreaService } from '../../services/studyArea.service';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import {MapService} from '../../services/map.services';
import { MatDialog, MatButtonToggleDefaultOptions } from '@angular/material';
// import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'tot-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: []
})


export class SidebarComponent {
  private MapService:MapService;
  private StudyAreaService:StudyAreaService;
  public AvailableScenarioTypes
  public dialog: MatDialog;
  public Collapsed:boolean;
  public SelectedProcedureType:ProcedureType;
  public PanelData = [ 
    {id:0, header:'MAP LAYERS', content: '', expanded: false},
    {id:1, header:'IDENTIFY AREA', expanded: true},
    {id:2, header:'SCENARIOS', content: '', expanded: false, disabled: true},
    {id:3, header:'BUILD REPORT', content: '', expanded: false, disabled: true}
  ];
  public get SelectedStudyArea() {return ""}
  public get SelectedScenarioType() {return ""}
  public get ZoomLevel():number{
    if (this.MapService.CurrentZoomLevel > 9 && this.toggleButton === true) {
      //this.barButtonOptions_downstream.disabled = false;
      this.toggleButton = false;
    }
    return this.MapService.CurrentZoomLevel;
  }

  private messanger:ToastrService;
  private toggleButton = true;

  public barButtonOptions_downstream: MatProgressButtonOptions;
  public barButtonOptions_upstream: MatProgressButtonOptions;
  public maplayerButton_points: MatProgressButtonOptions;
  public maplayerButton_natgeo: MatProgressButtonOptions;
  public maplayerButton_texas : MatProgressButtonOptions;
  public maplayerButton_topo: MatProgressButtonOptions;
  public maplayerButton_osm: MatProgressButtonOptions;

  constructor(mapservice:MapService, toastr: ToastrService) {
    this.messanger = toastr;
    this.MapService = mapservice;
   }

   ngOnInit() {
     this.barButtonOptions_downstream = {
      active: false,
      text: 'Spill Response',
      spinnerSize: 18,
      raised: true,
      stroked: false,
      buttonColor: 'primary',
      spinnerColor: 'accent',
      fullWidth: true,
      disabled: this.ZoomLevel < 10,
      mode: 'indeterminate'
    }

    this.barButtonOptions_upstream = {
      active: false,
      text: 'Spill Planning',
      spinnerSize: 18,
      raised: true,
      stroked: false,
      buttonColor: 'primary',
      spinnerColor: 'accent',
      fullWidth: true,
      disabled: true,
      mode: 'indeterminate'
     }

     this.maplayerButton_natgeo = {
       active: false,
       text: 'National Geographic',
       spinnerSize: 18,
       raised: true,
       stroked: false,
       buttonColor: 'primary',
       spinnerColor: 'accent',
       fullWidth: true,
       mode: 'indeterminate'
     }

     this.maplayerButton_texas = {
       active: false,
       text: 'Texas Hydro',
       spinnerSize: 18,
       raised: true,
       stroked: false,
       buttonColor: 'primary',
       spinnerColor: 'accent',
       fullWidth: true,
       mode: 'indeterminate'
     }

     this.maplayerButton_osm = {
       active: false,
       text: 'Open Street Maps',
       spinnerSize: 18,
       raised: true,
       stroked: false,
       buttonColor: 'primary',
       spinnerColor: 'accent',
       fullWidth: true,
       mode: 'indeterminate'
     }

     this.maplayerButton_topo = {
       active: false,
       text: 'Topographic',
       spinnerSize: 18,
       raised: true,
       stroked: false,
       buttonColor: 'primary',
       spinnerColor: 'accent',
       fullWidth: true,
       mode: 'indeterminate'
     }

     this.maplayerButton_points = {
       active: false,
       text: 'points',
       spinnerSize: 18,
       raised: true,
       stroked: false,
       buttonColor: 'primary',
       spinnerColor: 'accent',
       fullWidth: true,
       mode: 'indeterminate'
     }
   }

  //#maplayer "basemaps"
  private SetLayer(LayerName: string) {
    this.MapService.interactwBaselayer(LayerName);
  }

  private SetOverlay(LayerName: string) {
    this.MapService.interactwOverlayer(LayerName);
  }

  //#region "Methods"
  public SetScenarioType(ScenarioType:string) {
    if (ScenarioType = "Response") {
      this.StudyAreaService.selectedStudyArea.methodType = ScenarioType;
      //this.MapService.changeCursor("crosshair-cursor-enabled");
      this.barButtonOptions_downstream.buttonColor = 'accent';
    } else if (ScenarioType = "Spill Planning") {

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

  /* public openDialog() {
    let dialog = this.dialog.open(ModalComponent, {
      width: '40%',
      height: '90%',
      disableClose: true
    });
    dialog.afterClosed().subscribe(result => {
      this.mapReady = true;
    });
  } */

  public toggleLayer(newVal: string) {
    /* this.MapService.chosenBaseLayer = newVal;
    this.MapService.map.removeLayer(this.MapService.baseMaps['OpenStreetMap']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Topo']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Terrain']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Satellite']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Gray']);
    this.MapService.map.removeLayer(this.MapService.baseMaps['Nautical']);
    this.MapService.map.addLayer(this.MapService.baseMaps[newVal]); */
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
                //proceed only if StudyArea Selected
                if(!this.SelectedStudyArea) {
                  this.PanelData[pType].expanded = false;
                  throw new Error("Can not proceed until study area options are selected.");
                }
                return true;
            case ProcedureType.REPORT:
                if(!this.SelectedStudyArea) {
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

      this.messanger.show(msg,title,options, mType)
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
