import { Component, OnInit, NgZone, Input, AfterViewInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../../shared/messageType';
import { MapService } from '../../services/map.service';
import { deepCopy } from '../../../../shared/extensions/object.DeepCopy';
import { StudyService } from '../../services/study.service';
import { NavigationService } from '../../services/navigationservices.service';
import { NWISService } from '../../services/nwisservices.service'
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { SpillPlanningService } from '../../services/spillplanning.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpillPlanningModalComponent } from '../spillplanningmodal/spillplanningmodal.component';

declare let search_api: any;

@Component({
  selector: "tot-map",
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent extends deepCopy implements OnInit, AfterViewInit, OnChanges {

  //#region "Declarations"
  public fitBounds;
  public states: any = [];
  public reportMap = undefined;
  public poi;
  public flowlines;
  public layerGroup;
  public reportlayerGroup;
  public map: L.Map;
  public isfirst = true;
  public isInsideWaterBody: boolean = false;

  public set MousePosition(v: any) {
    this._mousePosition = v;
  }

  public get MousePosition(): any {
    return this._mousePosition;
  }

  //#region "Map helper methods of layerControl"
  public get LayersControl() {
    return this._layersControl;
  }

  public get Layers() {
    return this._layers;
  }

  public get MapOptions() {
    return this.MapService.Options;
  }

  private messager: ToastrService;
  private MapService: MapService;
  private NavigationService: NavigationService;
  private StudyService: StudyService;
  private NWISService: NWISService;
  private ToTCalculator: SpillPlanningService;
  private _layersControl;
  private _mousePosition;
  private _bounds;
  private _layers = [];
  private subscription: Subscription;
  private ShowUpstream: any;

  @Input() report: boolean;
  @Input() mapSize: string;

  scaleMap: string;


  ngOnChanges(changes: any) {
	// If map size changed, trigger resize event, which will force map to redraw
	// InvalidteSize does not work here. Not sure why.
	  /*if(changes.mapSize.previousValue != null && changes.mapSize.currentValue != changes.mapSize.previousValue){
		  window.dispatchEvent(new Event('resize'));
    }*/

    if (typeof (changes.previousValue) == 'undefined') {
      window.dispatchEvent(new Event('resize'));
    }
}
  //#endregion




  //MapOptions
  optionsSpec: any = {
    layers: [{ url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: 'Open Street Map' }],
    zoom: 5,
    center: [46.879966, -121.726909]
  };

  // Leaflet bindings
  zoom = this.optionsSpec.zoom;
  center = L.latLng(this.optionsSpec.center);

  options = {
    layers: [L.tileLayer(this.optionsSpec.layers[0].url, { attribution: this.optionsSpec.layers[0].attribution })],
    zoom: this.optionsSpec.zoom,
    center: L.latLng(this.optionsSpec.center),
  };

  //#endregion

  //#region "Contructor & ngOnit map subscribers
  constructor(mapservice: MapService, ToTCalculator: SpillPlanningService, private cdref: ChangeDetectorRef, navigationservice: NavigationService, toastr: ToastrService, studyservice: StudyService, nwisservice: NWISService, private modalService: NgbModal) {
    super();
    this.messager = toastr;
    this.MapService = mapservice;
    this.NavigationService = navigationservice;
    this.StudyService = studyservice;
    this.NWISService = nwisservice;
    this.layerGroup = new L.FeatureGroup([]); // streamLayer
    this.reportlayerGroup = new L.FeatureGroup([]);
    this.ToTCalculator = ToTCalculator;

    this.MapService.isInsideWaterBody.subscribe(data => {
      this.isInsideWaterBody = data;
    })
  }

  ngOnInit() {
    this.MapService.bounds.subscribe(b => {
      this.fitBounds = b;
    });

    this.NavigationService.navigationGeoJSON$.subscribe(data => {
      //console.log(data);
    });
    //#region "Base layer and overlay subscribers"
    // method to subscribe to the layers
    this.MapService.LayersControl.subscribe(data => {
      this._layersControl = {
        baseLayers: data.baseLayers.reduce((acc, ml) => {
          acc[ml.name] = ml.layer;
          return acc;
        }, {}),
        overlays: data.overlays.reduce((acc, ml) => { acc[ml.name] = ml.layer; return acc; }, {})
      };

      // method to filter out layers by visibility
      if (data.overlays.length > 0) {
        const activelayers = data.overlays
          .filter((l: any) => l.visible)
          .map((l: any) => l.layer);
        activelayers.unshift(data.baseLayers.find((l: any) => (l.visible)).layer);
        this._layers = activelayers;
      }
    });

    //#endregion

    //#region "Map helpers subscribers of services"
    this.MapService.LatLng.subscribe(res => {
        this.poi = res;
    });

    this.MapService.layerGroup.subscribe(layerGroup => {
      this.layerGroup = layerGroup;
    });

    this.MapService.reportlayerGroup.subscribe(reportlayerGroup => {
      this.reportlayerGroup = reportlayerGroup;
    });
  }

  //#endregion

  //#region "Report map helper"
  ngAfterViewInit() {
    // if this map is for the report
    if (this.report) {
      // if map already initialized, reset to avoid errors
      if (this.reportMap !== undefined) {
          this.reportMap.off();
          this.reportMap.remove();
      }
      this.reportMap = new L.Map('reportMap', this.options);
		  // add point of interest
	  	// MarkerMaker icon
		  var blackPin = L.divIcon({className: 'wmm-pin wmm-black wmm-icon-circle wmm-icon-white wmm-size-25'});
      // const marker = L.marker(this.poi, {icon: myIcon});
      const marker = L.marker(this.poi, {
          icon: blackPin,
      });

      marker.addTo(this.reportMap);
      this.reportlayerGroup.addTo(this.reportMap);

      this.reportMap.fitBounds(this.layerGroup.getBounds());
    }
  }

  //#endregion

  //#region "Map click events"
  public onMapReady(map: L.Map) {
    map.invalidateSize();
    this.MapService.map = map;
    L.control.scale().addTo(map);

    if(this.ShowUpstream) {
      const legend = new L.Control({ position: 'bottomright' });
      legend.onAdd = map => {
        let div = L.DomUtil.create('div', 'info legend');

        div.innerHTML = '<div style="background-color: white; box-shadow: 0 5px 20px 0 rgb(0 0 0 / 20%); border-radius: 3px;">';
        div.innerHTML += '<div><b>Travel Times</b></div>';
        div.innerHTML += '<i style="background: #0BDCD5"> &nbsp; &nbsp;</i> &nbsp;>0-5 hours <br/>';
        div.innerHTML += '<i style="background: #D3DC0B"> &nbsp; &nbsp;</i> &nbsp;>5-15 hours <br/>';
        div.innerHTML += '<i style="background: #144893"> &nbsp; &nbsp;</i> &nbsp;>15-35 hours <br/>';
        div.innerHTML += '<i style="background: #14933E"> &nbsp; &nbsp;</i> &nbsp;>35-60 hours <br/>';
        div.innerHTML += '<i style="background: #020234"> &nbsp; &nbsp;</i> &nbsp;>60 hours <br/>';
        div.innerHTML += '</div>';

        return div;
      }
      legend.addTo(map);
    }
  }

  public onZoomChange(zoom: number) {
    this.MapService.CurrentZoomLevel.next(zoom);
    this.MapService.nominalZoomLevel.next(this.MapService.scaleLookup(zoom))
    this.cdref.detectChanges();
  }

  public onMouseClick(evnt: any) { // need to create a subscriber on init and then use it as main poi value;
    if (this.StudyService.GetWorkFlow('hasMethod')) {
      (document.getElementById(this.StudyService.selectedStudy.MethodType) as HTMLInputElement).disabled = true;
      (document.getElementById(this.StudyService.selectedStudy.MethodType) as HTMLInputElement).classList.remove('waiting');

      if (this.StudyService.selectedStudy.MethodType == 'response') {
        this.setPOI(evnt.latlng, 'downstream');
      } else {
        this.setPOI(evnt.latlng, 'upstream');
      }
    }
  }

  public getLatLong(evnt: any) { 
    this._mousePosition = evnt.latlng;
  }

  //#endregion

  //#region "Helper methods (create FeatureGroup layer)"
  private setPOI(latlng: L.LatLng, inputString: string) {
    if (!this.StudyService.GetWorkFlow('hasPOI')) {
      this.sm('Point selected. Loading...');
      this.MapService.setCursor('');
      this.StudyService.SetWorkFlow('hasPOI', true);
      this.MapService.SetPoi(latlng);
      if (this.MapService.CurrentZoomLevel.value < 10 || !this.MapService.isClickable) { return; }
	  

      // MarkerMaker icon
      var blackPin = L.divIcon({className: 'wmm-pin wmm-black wmm-icon-circle wmm-icon-white wmm-size-25'});
      const marker = L.marker(latlng, {
        icon: blackPin
      });
      // add marker to map
      this.MapService.AddMapLayer({ name: 'POI', layer: marker, visible: true });

      this.NavigationService.getNavigationResource('3')
        .toPromise().then(data => {
          const config: Array<any> = data.configuration;
          config.forEach(item => {
            switch (item.id) {
              case 1: item.value = marker.toGeoJSON().geometry;
                      item.value.crs = { properties: { name: 'EPSG:4326' }, type: 'name' };
                      break;
              case 6: item.value = ['flowline', 'nwisgage']; // "flowline", "wqpsite", "streamStatsgage", "nwisgage"
                      break;
              case 5: item.value = inputString;
                      break;
              case 0: if (this.StudyService.isMetric()) {
                        item.value = { id: 3, description: 'Limiting distance in kilometers from starting point', name: 'Distance (km)', value: this.StudyService.distance, valueType: 'numeric' };
                      } else {
                        var imp_distance = this.StudyService.distance * 1.609344; //converts miles to kilometers
                        item.value = { id: 3, description: 'Limiting distance in kilometers from starting point', name: 'Distance (km)', value: imp_distance, valueType: 'numeric' };
                      }
                      
            }// end switch
          }); // next item
          return config;
        }).then(config => {
          this.NavigationService.getRoute('3', config, true).subscribe(response => {
            this.NavigationService.navigationGeoJSON$.next(response);
            response.features.shift();
            //this.ToTCalculator.passageTimeTest();
            //this.MapService.FlowLines.next(response.features);
            //console.log(response);
            if (inputString == "upstream") {
              this.StudyService.selectedStudy.Reaches = this.formatReaches(response);
              this.StudyService.selectedStudy.spillPlanningResponse = response.features;
              this.openPlanningModal();
              // this.ComputeTOT(response.features);
              // this.accumTOT(response.features);
              // this.getFlowLineLayerGroup(response.features);
              // this.StudyService.selectedStudy.Reaches = this.formatReaches(response);
              // this.MapService.AddMapLayer({ name: 'Flowlines', layer: this.layerGroup, visible: true });
              // this.StudyService.selectedStudy.LocationOfInterest = latlng;
            } else {
              this.MapService.getFlowLineLayerGroup(response.features);
              this.check4gages(response.features);
              this.StudyService.selectedStudy.Reaches = this.formatReaches(response);
              this.MapService.AddMapLayer({ name: 'Flowlines', layer: this.layerGroup, visible: true });
              this.StudyService.SetWorkFlow('hasReaches', true);
              this.StudyService.selectedStudy.LocationOfInterest = latlng;
              this.StudyService.setProcedure(2);
            }
            //one with the biggest drainage area is the first one to trace up
          });
        }).finally(() => {
          //if overland trace occurs run next line
          //this.sm('Travel time not computed for overland/raindrop trace portion');
        })
    }
  }

  public ComputeTOT(data) {
    data.forEach(reach => {
      if (reach.properties.hasOwnProperty("Discharge")) {
        var tot = this.ToTCalculator.passageTime(reach.properties.Length, reach.properties.Discharge * 0.0283168, reach.properties.Discharge * 0.0283168, reach.properties.DrainageArea * 10 ^ 6);
        reach.properties["result"] = tot;
        reach.properties["touched"] = false;
      }
    })
  }

  public accumTOT(data) {
    var DA = 0;
    var headCOMID = 0;
    var newDA = 0;

    data.forEach(reach => { //find the biggest drainage corresponding to the selected POI
      newDA = reach.properties.DrainageArea;
      if (newDA > DA) {
        DA = newDA;
        headCOMID = reach.properties.nhdplus_comid;
      }
    })

    data.forEach(reach => { //mark reach with biggest drainage
      if (reach.properties.nhdplus_comid == headCOMID) {
        reach.properties["accutot"] = reach.properties.result;
        reach.properties.touched = true;
        this.sumacc(data, reach);
      }
    })
  }

  public sumacc(data, prev) {
    data.forEach(reach => {
      if (reach.properties.ToNode == prev.properties.FromNode && !reach.properties.touched) {
        reach.properties.accutot = prev.properties.accutot + reach.properties.result;
        reach.properties.touched = true;
        this.sumacc(data, reach);
      }
    })
  }

  private check4gages(features) {
    const layerGroup = new L.FeatureGroup([]);
    const reportlayerGroup = new L.FeatureGroup([]);
    let gagesArray = [];
    features.forEach(i => {

      if (i.geometry.type === 'Point') {
        var siteID = i.properties.identifier.replace("USGS-", "");
		// MarkerMaker Icon
		var blackTriangle = L.divIcon({className: 'wmm-triangle wmm-black wmm-size-15'});
        layerGroup.addLayer(L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { 
			icon: blackTriangle
		}).bindPopup('<h3>Streamgages</h3><br /><b>Station ID: </b>' + siteID + '<br /><b>Station Name: </b>' + i.properties.name + '<br /><b>Station Latitude: </b>' + i.geometry.coordinates[1] + '<br /><b>Station Longitude: </b>' + i.geometry.coordinates[0] + '<br /><b>NWIS page: </b><a href="' + i.properties.uri + '" target="_blank">link</a><br /><b>StreamStats Gage page: </b><a href="https://streamstatsags.cr.usgs.gov/gagepages/html/' + siteID + '.htm" target="_blank">link</a>'));
        reportlayerGroup.addLayer(L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { 
			icon: blackTriangle
		}));
        gagesArray.push(i);
      } 
    })

    //check if there is a gage data;
    if (gagesArray.length > 0) {
      for (var i = 0; i < gagesArray.length; i++) {
        features.forEach(o => {
          if (o.geometry.type !== "Point") {
            if (gagesArray[i].properties.comid == String(o.properties.nhdplus_comid)) {
              gagesArray[i].properties["drainagearea"] = o.properties.DrainageArea / 2.59; //in sqmiles
            } else { }
          }
        })
      };
      //create service
      //add gage
      this.NWISService.gagesArray.next(gagesArray);
      this.MapService.gageDischargeSearch.next(true);
      this.NWISService.getMostRecentFlow(gagesArray);
    } else {
      this.MapService.gageDischargeSearch.next(true);
    };

    // because it is async it takes time to process function above, once we have it done - we get the bounds
    // Potential to improve
    setTimeout(() => {
      this.MapService.setBounds(layerGroup.getBounds());
    });
  }

  private openPlanningModal(): void {
    if (this.isInsideWaterBody) {
      this.sm("Selected point of interest is inside of a water body.... please select different location")
    } else {
      const spillPlanningModalRef = this.modalService.open(SpillPlanningModalComponent);
      spillPlanningModalRef.componentInstance.title = 'Spill Planning';
    }
  }

  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }

  private formatReaches(data): any {
    const streamArray = [];
    for (let i = 0; i < data.features.length; i++) {
      if (data.features[i].geometry.type === 'LineString') {
        const polylinePoints = this.deepCopy(data.features[i]);
        streamArray.push(polylinePoints);
      }
    }
    streamArray.map((reach) => {
      reach.properties.show = false;
    });

    const sortArray = streamArray.sort( (a, b) => {
      return a.properties.DrainageArea - b.properties.DrainageArea;
    });
    return (sortArray);
  }
  //#endregion

}

