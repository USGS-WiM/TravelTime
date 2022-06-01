import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbAccordion, NgbPanelChangeEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TravelTimeService } from '../../../services/traveltimeservices.service';
import { MapService } from '../../../services/map.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { reach } from '../../../models/reach';
import { StudyService } from '../../../services/study.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../../../shared/messageType';
import { BehaviorSubject } from 'rxjs';
import { GagesComponent } from '../gages/gages.component';
import { NWISService } from '../../../services/nwisservices.service'
import { SpillPlanningService } from '../../../services/spillplanning.service';
import * as L from 'leaflet';

export const DateTimeValidator = (fc: FormControl) => {
  const date = new Date(fc.value);
  const isValid = !isNaN(date.valueOf());
  return isValid ? null : {
    isValid: {
      valid: false
    }
  };
};

@Component({
  selector: 'app-spillplanning',
  templateUrl: './spillplanning.component.html',
  styleUrls: ['./spillplanning.component.scss']
})
export class SpillPlanningComponent implements OnInit {

  public gages;
  public NWISService: NWISService;
  public appVersion: string;
  public TravelTimeService: TravelTimeService;
  public StudyService: StudyService;
  public MapService: MapService;
  public ToTCalculator: SpillPlanningService;
  public dateModel: Date = new Date();
  public formGroup: FormGroup;
  public reach_reference: reach;
  public reachList: Array<any> = [];
  public units;
  public abbrev;
  public inputIsValid: boolean = false;
  public dischargeSub = new BehaviorSubject<number>(undefined);
  public reachIDs = [];
  public model = {};
  public showhidetitle = 'Show Reaches';
  public showReaches: boolean = true;
  public gettingResults: boolean = false;
  public showDetails: Array<any>;
  public FirstReachDischarge;
  public layerGroup;
  private _spillMass: number;
  private _discharge: number;
  private _recoveryratio = 1;
  private messager: ToastrService;
  private lastIndex = null;
  private selectedIndex = null;
  private currentStep = 0;

    //#region "Setters"
    public get SpillMass(): number {
      return this._spillMass;
    }
    public set SpillMass(v: number) {
      this._spillMass = v;
      this.StudyService.selectedStudy.SpillMass = this._spillMass;
    }
    public get Discharge(): number {
      return this._discharge;
    }
    public set Discharge(v: number) {
      this._discharge = v;
      this.StudyService.selectedStudy.Discharge = this._discharge;
    }
    public set RecoveryRatio(v: number) {
      this._recoveryratio = v;
      this.StudyService.selectedStudy.RecoveryRatio = this._recoveryratio;
    }
    public get RecoveryRatio(): number {
      return this._recoveryratio;
    }
    private _dtData: boolean = true;
    public get HasDTData(): boolean {
      return this._dtData;
    }
    private _useDTData: boolean;
    public get UseDTData(): boolean {
      return this._useDTData;
    }
    public set UseDTData(v: boolean) {
      this._useDTData = v;
    }
    private _showGages: boolean = false;
    public get ShowGages(): boolean {
      return this._showGages;
    }
    //#endregion

  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, traveltimeservice: TravelTimeService, mapservice: MapService, studyservice: StudyService, tstrservice: ToastrService, private modalService: NgbModal, public nwisservice: NWISService, ToTCalculator: SpillPlanningService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.TravelTimeService = traveltimeservice;
    this.MapService = mapservice;
    this.NWISService = nwisservice;
    this.NWISService.gages$.subscribe(data => {
      this.gages = data;
    })
    this.StudyService = studyservice;
    this.ToTCalculator = ToTCalculator;
    this.messager = tstrservice;
    this.layerGroup = new L.FeatureGroup([]); // streamLayer
  }

  ngOnInit(): any {   // on init, get the services for first reach, and add them as parameters to accordion
    this.units = this.MapService.unitsOptions;
    this.abbrev = this.MapService.abbrevOptions;
    this.formGroup = new FormGroup({
      activeEndDate: new FormControl(new Date(), { validators: [Validators.required, DateTimeValidator] })
    }, { updateOn: 'change' });

    this.NWISService.gagesArray.subscribe(data => {
      if (typeof (data) != 'undefined') {
        this.MapService.showGages.subscribe(data => {
          this._showGages = data;
        })
      }
    })
  }

  //#region "Gages"
  public openGagesModal() {
    const modalConfig = this.modalService.open(GagesComponent);
    modalConfig.componentInstance.title = 'Gages';
  }
  //#endregion

  log(val) { 
    //console.log(val); 
  }

  public validateInputs(): boolean {
    if (typeof (this.Discharge) === "number") {
        return false;
    } else {
        return true;
    }
  }

  public firstReachDischarge(): void {
    try {
      if(this.StudyService.isMetric()) {
        if(this.StudyService.selectedStudy.RDP.length > 1) {
          this.FirstReachDischarge = (this.StudyService.selectedStudy.spillPlanningResponse.features[1].properties.Discharge * 0.028316847).toFixed(2);
        } else {
          this.FirstReachDischarge = (this.StudyService.selectedStudy.spillPlanningResponse.features[0].properties.Discharge * 0.028316847).toFixed(2);
        }        
      } else {
        if(this.StudyService.selectedStudy.RDP.length > 1) {
          this.FirstReachDischarge = (this.StudyService.selectedStudy.spillPlanningResponse.features[1].properties.Discharge).toFixed(2);
        } else {
          this.FirstReachDischarge = (this.StudyService.selectedStudy.spillPlanningResponse.features[0].properties.Discharge).toFixed(2);
        }
      }
    } catch(ex) {
      console.log(ex);
    }
  }

   //#region "Methods"
  public setDischarge(): void {
    if (this.StudyService.selectedStudy.spillPlanningResponse.features.length > 0) {
      this.StudyService.selectedStudy.Discharge = this._discharge;
      let ratio;
      let cond = false;

      this.StudyService.selectedStudy.spillPlanningResponse.features.forEach( i => {
      if(i.properties.nhdplus_comid) {
        if (!this.StudyService.isMetric()) {  //spillPlanningResponse is in imperial units and must be converted to metric for jobson's equations. User input is in whatever units he/she specifies.
          if (cond) { //user has specified imperial units            
            i.properties.Discharge = i.properties.Discharge * 0.028316847;  // mean annual discharge from cfs to cms
            i.properties.RTDischarge = (ratio * i.properties.Discharge).toFixed(3); 
          } else {
            i.properties.RTDischarge = this._discharge * 0.028316847; // discharge from cfs to cms
            i.properties.Discharge = i.properties.Discharge * 0.028316847;  // mean annual discharge from cfs to cms
            ratio = (i.properties.RTDischarge / i.properties.Discharge).toFixed(3);
            cond = true;
          } 
        } else { 
          if (cond) { //user has specified metric units
            i.properties.Discharge = i.properties.Discharge * 0.028316847;  // mean annual discharge from cfs to cms
            i.properties.RTDischarge = (ratio * i.properties.Discharge).toFixed(3);
          } else {
            i.properties.RTDischarge = this._discharge;
            i.properties.Discharge = i.properties.Discharge * 0.028316847;  // mean annual discharge from cfs to cms
            ratio = (i.properties.RTDischarge / i.properties.Discharge).toFixed(3);
            cond = true;
          }
        }
      }
      })      
      this.StudyService.SetWorkFlow('hasDischarge', true);
    } else {
      this.setDischarge();
    }
    this.StudyService.setDischarge(this._discharge);
  }

  public ComputeTOT() {
    this.StudyService.selectedStudy.spillPlanningResponse.features.forEach(reach => {
      if (reach.properties.hasOwnProperty("Discharge")) {
          var tot = this.ToTCalculator.peakTimeofTravel(reach.properties.Length, reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'most');
          var totmax = this.ToTCalculator.peakTimeofTravel(reach.properties.Length, reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'max');
          var tl = this.ToTCalculator.leadingEdge(reach.properties.Length, reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'most');
          var tlmax = this.ToTCalculator.leadingEdge(reach.properties.Length, reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'max');
          var td10 = this.ToTCalculator.trailingEdge(reach.properties.Length, reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'most');
          var td10max = this.ToTCalculator.trailingEdge(reach.properties.Length, reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'max');
          
          reach.properties["T_p"] = tot;
          reach.properties["T_pmax"] = totmax;
          reach.properties["T_l"] = tl;
          reach.properties["T_lmax"] = tlmax;
          reach.properties["T_d10"] = td10 + tl;
          reach.properties["T_d10max"] = td10max + tlmax;
          reach.properties["VelocityMost"] = this.ToTCalculator.peakVelocity(reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'most');
          reach.properties["VelocityMax"] = this.ToTCalculator.peakVelocity(reach.properties.RTDischarge, reach.properties.Discharge, (reach.properties.DrainageArea * 1000000), 'max');
          reach.properties["touched"] = false;
      }
    })
  }

  public accumTOT() {
    var DA = 0;
    var headCOMID = 0;
    var newDA = 0;

    this.StudyService.selectedStudy.spillPlanningResponse.features.forEach(reach => { //find the biggest drainage corresponding to the selected POI
      if (reach.properties.hasOwnProperty("Discharge")) {
        newDA = reach.properties.DrainageArea;
        if (newDA > DA) {
          DA = newDA;
          headCOMID = reach.properties.nhdplus_comid;
        }
      }
    })

    this.StudyService.selectedStudy.spillPlanningResponse.features.forEach(reach => { //mark reach with biggest drainage
      if (reach.properties.nhdplus_comid == headCOMID) {
        reach.properties["accutot"] = reach.properties.T_p;
        reach.properties["accutl"] = reach.properties.T_l;
        reach.properties["accutd10"] = reach.properties.T_d10;
        reach.properties["accutotmax"] = reach.properties.T_pmax; 
        reach.properties["accutlmax"] = reach.properties.T_lmax;
        reach.properties["accutd10max"] = reach.properties.T_d10max;     
        reach.properties.touched = true;
        this.sumacc(this.StudyService.selectedStudy.spillPlanningResponse.features, reach);
      }
    })
  }

  public sumacc(data, prev) {
    data.forEach(reach => {
      if (reach.properties.ToNode == prev.properties.FromNode && !reach.properties.touched) {
        reach.properties.accutot = prev.properties.accutot + reach.properties.T_p;
        reach.properties.accutotmax = prev.properties.accutotmax + reach.properties.T_pmax;
        reach.properties.accutl = prev.properties.accutl + reach.properties.T_l;
        reach.properties.accutlmax = prev.properties.accutlmax + reach.properties.T_lmax;
        reach.properties.accutd10 = prev.properties.accutd10 + reach.properties.T_d10;
        reach.properties.accutd10max = prev.properties.accutd10max + reach.properties.T_d10max;
        reach.properties.touched = true;
        this.sumacc(data, reach);
      }
    })
  }

  private checkUnits() { //sets units to user-requested display
    this.StudyService.selectedStudy.spillPlanningResponse.features.forEach( i => {
      if (!this.StudyService.isMetric()) {            
        i.properties.RTDischarge = (i.properties.RTDischarge * 35.314666212661).toUSGSvalue(); //real-time flow from cms to cfs
        i.properties.Discharge = (i.properties.Discharge * 35.314666212661).toUSGSvalue(); //mean annual flow from cms to cfs
        i.properties.DrainageArea = (i.properties.DrainageArea * 0.38610).toUSGSvalue();  // drainage area from square kilometers to square miles
        i.properties.Length = (i.properties.Length * 0.621371).toUSGSvalue();  // reach length from kilometers to miles
        i.properties.VelocityMost = (i.properties.VelocityMost * 3.28084).toUSGSvalue(); //velocity from m/s to ft/s
        i.properties.VelocityMax = (i.properties.VelocityMax * 3.28084).toUSGSvalue(); //velocity from m/s to ft/s
        i.properties.T_p = (i.properties.T_p * 1).toUSGSvalue(); // rounds values
        i.properties.T_pmax = (i.properties.T_pmax * 1).toUSGSvalue();
        i.properties.accutot = (i.properties.accutot * 1).toUSGSvalue();
        i.properties.accutotmax = (i.properties.accutotmax * 1).toUSGSvalue();
      } else { //user has specified metric units
        i.properties.RTDischarge = (i.properties.RTDischarge * 1).toUSGSvalue(); // rounds values
        i.properties.Discharge = (i.properties.Discharge * 1).toUSGSvalue(); 
        i.properties.DrainageArea = (i.properties.DrainageArea * 1).toUSGSvalue();  
        i.properties.Length = (i.properties.Length * 1).toUSGSvalue();  
        i.properties.VelocityMost = (i.properties.VelocityMost * 1).toUSGSvalue(); 
        i.properties.VelocityMax = (i.properties.VelocityMax * 1).toUSGSvalue(); 
        i.properties.T_p = (i.properties.T_p * 1).toUSGSvalue();
        i.properties.T_pmax = (i.properties.T_pmax * 1).toUSGSvalue();
        i.properties.accutot = (i.properties.accutot * 1).toUSGSvalue();
        i.properties.accutotmax = (i.properties.accutotmax * 1).toUSGSvalue();
      }
    })  
  }

  public validateForm(mainForm): boolean {
      //console.log(mainForm.$valid);
    if (mainForm.$valid) {
      return true;
    } else {
      return false;
    }
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }

  public beforeChange($event: NgbPanelChangeEvent): void {
    this.currentStep = +($event.panelId);
  }

  public getLabel(label) {
    try {
      switch (label) {
        case 'leadingEdge':
          return 'Leading Edge';
        case 'MostProbable':
          return 'Most Probable';
        case 'concentration':
          return 'Concentration';
        case 'time':
          return 'Time';
        case 'MaximumProbable':
          return 'Maximum Probable';
        case 'peakConcentration':
          return 'Peak Concentration';
        case 'trailingEdge':
          return 'Trailing Edge';
        case 'name':
          return 'Name';
        case 'description':
          return 'Description';
      }// end switch
    } catch (e) {
      let x = e;
    }
  }

  public getResults() {
    if (this.dateModel instanceof Date) {
       } else {
         this.dateModel = new Date(this.dateModel);
       }
    this.ComputeTOT();
    this.accumTOT();
    this.checkUnits();
    this.StudyService.selectedStudy.Results = this.StudyService.selectedStudy.spillPlanningResponse;
    this.StudyService.SetWorkFlow('totResults', true);
    this.activeModal.dismiss();   
    this.MapService.showUpstream.next(true);

    //Set default footer height to half, show buttons to switch
    $('#mapWrapper').attr('class', 'half-map');
    $('body').attr('class', 'half-toast-map');
    $('#mapHeightToggle').attr('class', 'visible');

    this.StudyService.setProcedure(3); // open footer panel;
   }

  public identify(index, item): number {
    return item.id;
 }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) options = { timeOut: timeout };

      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }
    //#endregion

}
