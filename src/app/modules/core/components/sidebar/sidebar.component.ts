import { Component, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../../shared/messageType';
import {MapService} from '../../services/map.service';
import { MatDialog, MatButtonToggleDefaultOptions } from '@angular/material';
import { Study } from '../../models/study';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JobsonsModalComponent } from '../jobsons/jobsons.component';
import { ApptoolsComponent } from '../apptools/apptools.component';
import { ReportModalComponent } from '../report/report.component';
import * as L from 'leaflet';

declare let search_api: any;

@Component({
  selector: 'tot-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  providers: []
})


export class SidebarComponent implements AfterViewChecked {


  private MapService: MapService;
  private StudyService: StudyService;
  public AvailableScenarioTypes = [{ name: 'Jobson\'s', selected: true }];
  public dialog: MatDialog;
  public Collapsed: boolean;

  private _canContinue = false;
  public get CanContinue(): boolean {
    if (this.StudyService.ReportOptions) {
      for (const element of this.StudyService.ReportOptions) {
        if (element.checked) {
          this._canContinue = true;
          return this._canContinue;
          break;
        }
      }
    }
    this._canContinue = false;
    return this._canContinue;
  }

  public SelectedScenario: String = 'Jobsons';

  private _selectedproceduretype: ProcedureType;
  public get SelectedProcedureType(): ProcedureType {
    return this._selectedproceduretype;
  }
  public set SelectedProcedureType(v: ProcedureType) {
      this._selectedproceduretype = v;
  }

  public get SelectedStudy() {return this.StudyService.selectedStudy;}
  public get SelectedMethodType() {
    return (this.StudyService && this.StudyService.selectedStudy ? this.StudyService.selectedStudy.MethodType : '');
  }

  /*public ZoomLevel() {
    this.MapService.CurrentZoomLevel.subscribe(z => {
      if (z > 9 && this.toggleButton === true) {
        this.StudyService.SetWorkFlow('reachedZoom', true);
      }
      return z;
    })
    //return this.MapService.CurrentZoomLevel.value;
  }*/

  public ishiddenBasemaps = true;
  public ishiddenOverlay = false;
  public baselayers = [];
  public overlays = [];
  public model;
  private messager: ToastrService;
  private toggleButton = true;
  public zoom = 4;

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  // tslint:disable-next-line: max-line-length
  constructor(mapservice: MapService, private cdRef: ChangeDetectorRef, toastr: ToastrService, studyservice: StudyService, config: NgbModalConfig, private modalService: NgbModal) {
    this.messager = toastr;
    this.MapService = mapservice;
    this.StudyService = studyservice;
    config.backdrop = 'static';
    config.keyboard = false;
    this.MapService.isInsideWaterBody.subscribe(data => {
      this.isInsideWaterBody = data;
    })
    this.MapService.CurrentZoomLevel.next(this.zoom);
    this.MapService.nominalZoomLevel.next(this.MapService.scaleLookup(this.zoom))
    this.MapService.CurrentZoomLevel.subscribe(z => {
      this.zoom = z;
      if (z > 9 && this.toggleButton === true) {
        this.StudyService.SetWorkFlow('reachedZoom', true);
      } else {
        this.StudyService.SetWorkFlow('reachedZoom', false);
      }
    })
  }

  ngOnInit() {
      this.MapService.LayersControl.subscribe(data => {
        if (this.overlays.length > 0 || this.baselayers.length > 0) {
          this.overlays = [];
          this.baselayers = [];
        }
        this.overlays = data.overlays;
        this.baselayers = data.baseLayers;
      });

      search_api.create('searchBox', {
        on_result: (o) => { // changed from function(o) to (o) =>
          this.MapService.setBounds([ // zoom to location
            [o.result.properties.LatMin, o.result.properties.LonMin],
            [o.result.properties.LatMax, o.result.properties.LonMax]
          ]);
          // MarkerMaker icon
          var redCircle = L.divIcon({className: 'wmm-circle wmm-borderless wmm-red wmm-size-35'});
          const marker = L.marker([o.result.properties.Lat, o.result.properties.Lon], {
          icon: redCircle,
          opacity: 0.7
      });
          this.MapService.AddMapLayer({ name: 'Search Location', layer: marker, visible: true });
        },
        on_failure: (o) => {
        // Should we alert the user ? this can be used if (for example length of the array is not sufficient for search)
        // alert("Sorry, a location could not be found for '" + o.val() + "'");
      }
    });

      this.model = {
      baselayers: {},
      overlays: {}
    };

      this.SelectedProcedureType = 1; // set initial procedure type

      this.StudyService.procedureType$.subscribe(data => { // subscribe to the shared service
      if (!this.canUpdateProcedure(data)) {
        return;
      }
      this.SelectedProcedureType = data;
    });



      this.StudyService.ReportOptions = [
      { name: 'Map of study area', checked: false },
      { name: 'Table of values', checked: false },
      { name: 'Graph of timeline', checked: false }
    ];
  }

  public SetBaselayer(LayerName: string) {
    this.MapService.SetBaselayer(LayerName);
  }

  public SetOverlay(LayerName: string) {
    this.MapService.SetOverlay(LayerName);
  }

  //#region "Methods"
  public GetClass(pType: ProcedureType) {
    if (this.SelectedProcedureType === pType) {
      return 'list-group-item-active';
    } else { return 'list-group-item'; }
  }

  public SetMethodType(MethodType: string) {
    this.StudyService.SetWorkFlow('hasMethod', true); // map click will result in POI selection
    this.StudyService.selectedStudy = new Study(MethodType);
    this.MapService.isClickable = true;
    this.MapService.setCursor('crosshair');
  }

  public ToggleScenario(i) {
    if (this.AvailableScenarioTypes && this.AvailableScenarioTypes[i]) {
      // if(this.AvailableScenarioTypes[i].selected === false) {
      //   this.AvailableScenarioTypes[i].selected = true;
        this.SelectedScenario = i.name;
      // } else {
      // this.AvailableScenarioTypes[i].selected = false;
      // }
    }
  }

  public ToggleReportOptions(i) {
    if (this.StudyService.ReportOptions && this.StudyService.ReportOptions[i]) {
      if (!this.StudyService.ReportOptions[i].checked) {
        this.StudyService.ReportOptions[i].checked = true;
      } else {
        this.StudyService.ReportOptions[i].checked = false;
      }
    }
  }

  public HideReportOptions() {
    if (this.StudyService.ReportOptions) {
      this.StudyService.ReportOptions.forEach(item => {
        if (item.checked === true) { return false; }
      });
      return true;
    }
  }

  public isInsideWaterBody: boolean = false;



  public open(scenario) {
    switch (scenario) {
      case 'Jobsons':
        if (this.isInsideWaterBody) {
          this.sm("Selected point of interest is inside of a water body.... please select different location")
        } else {
          const jobsonsModalRef = this.modalService.open(JobsonsModalComponent);
          jobsonsModalRef.componentInstance.title = 'Jobsons';
        }
        return;
      case 'Report':
        const reportModalRef = this.modalService.open(ReportModalComponent);
        reportModalRef.componentInstance.title = 'Report';
        return;
      default: return;
    }
  }

  public reset() {
    window.location.reload();
  }

  public SetProcedureType(indx: number) {
    this.StudyService.setProcedure(indx);
  }

  public open_config() {
    const modalConfig = this.modalService.open(ApptoolsComponent);
    modalConfig.componentInstance.title = 'Configure';
  }
  //#endregion

  //#region "Private methods"
  private init() {
    this.SelectedProcedureType = ProcedureType.IDENTIFY;
  }
  private canUpdateProcedure(pType: ProcedureType): boolean {
    try {
        switch (pType) {
            case ProcedureType.MAPLAYERS:
              if (this.SelectedProcedureType === 0) {
                return false;
              }
              return true;
            case ProcedureType.IDENTIFY:
                if (this.SelectedProcedureType === 1) {
                  return false;
                }
                return true;
            case ProcedureType.SCENARIO:
                // proceed only if Study Selected
                // tslint:disable-next-line: max-line-length
                if (!this.StudyService.GetWorkFlow('hasReaches')) {throw new Error('Can not proceed until study area options are selected.'); }
                if (this.SelectedProcedureType === 2) { return false; }
                return true;
            case ProcedureType.REPORT:
                if (!this.StudyService.selectedStudy || !this.StudyService.GetWorkFlow('totResults')) { return; }
                if (this.SelectedProcedureType === 3) {
                  return false;
                }
                return true;
            default:
                return false;
        }// end switch
    } catch (e) {
        this.sm(e.message, messageType.WARNING);
        return false;
    }
  }
  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options ={timeOut:timeout}; }
      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }
  //#endregion
}

enum ProcedureType {
  MAPLAYERS = 0,
  IDENTIFY = 1,
  SCENARIO = 2,
  REPORT = 3
}
