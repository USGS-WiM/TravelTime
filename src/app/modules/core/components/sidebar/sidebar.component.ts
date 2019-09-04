import { Component } from '@angular/core';
import { StudyAreaService } from '../../services/studyArea.service';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";

@Component({
  selector: 'tot-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: []
})


export class SidebarComponent {
  public AvailableScenarioTypes: [];
  public Collapsed:boolean;
  public SelectedProcedureType:ProcedureType;
  public get SelectedStudyArea() {return ""}
  public get SelectedScenarioType() {return ""}

  private messanger:ToastrService;
  
  constructor(toastr: ToastrService) {
    this.messanger = toastr;
   }

  //#region "Methods"
  public SetScenarioType(ScenarioType:string) {
    // spill response | planning
    console.log(ScenarioType)
  }
  
  public SetProcedureType(pType){
    if(!this.canUpdateProcedure(pType)) return;
  
    this.SelectedProcedureType = pType;
  }
  
  public ToggleSideBar(){
    if (this.Collapsed) this.Collapsed = false;
            else this.Collapsed = true; 
  }

  public barButtonOptions_downstream: MatProgressButtonOptions = {
    active: false,
    text: 'Spill Response',
    spinnerSize: 18,
    raised: true,
    stroked: false,
    buttonColor: 'primary',
    spinnerColor: 'accent',
    fullWidth: true,
    disabled: true,
    mode: 'indeterminate'
  }

  public barButtonOptions_upstream: MatProgressButtonOptions = {
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
                if(!this.SelectedStudyArea) throw new Error("Can not proceed until study area options are selected.")
                return true;
            case ProcedureType.REPORT:
                if(!this.SelectedStudyArea) throw new Error("Can not proceed until study area options are selected.")
                if(!this.SelectedScenarioType) throw new Error("Can not proceed until Scenario options are selected.")
                return true;
            default:
                return false;
        }//end switch          
    }
    catch (e) {
        this.sm(e.message,messageType.ERROR )
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
