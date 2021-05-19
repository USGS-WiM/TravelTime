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
import { SpillPlanningComponent } from '../modals/spill-planning/spillplanning.component';
import { NLDIService } from '../../services/nldiservices.service';

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
  public scaleMap: string;

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
  private NLDIService: NLDIService;
  private _layersControl;
  private _mousePosition;
  private _bounds;
  private _layers = [];
  private subscription: Subscription;
  private _showUpstream: any;
  private RDP: any;
  private firstReach: any;

  public get ShowUpstream(): boolean {
    return this._showUpstream;
  }

  @Input() report: boolean;
  @Input() mapSize: string;

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
  constructor(mapservice: MapService, ToTCalculator: SpillPlanningService, private cdref: ChangeDetectorRef, navigationservice: NavigationService, toastr: ToastrService, studyservice: StudyService, nwisservice: NWISService, private modalService: NgbModal, nldiService: NLDIService) {
    super();
    this.messager = toastr;
    this.MapService = mapservice;
    this.NavigationService = navigationservice;
    this.StudyService = studyservice;
    this.NWISService = nwisservice;
    this.NLDIService = nldiService;
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

    this.MapService.showUpstream.subscribe(data => {
      this._showUpstream = data;
      if(this.ShowUpstream) {
        const legend = new L.Control({ position: 'topright' });
        legend.onAdd = map => {
          let div = L.DomUtil.create('div', 'info legend');
  
          div.innerHTML = '<div style="background-color: white; box-shadow: 0 5px 20px 0 rgb(0 0 0 / 20%); border-radius: 3px;">';
          div.innerHTML += '<div><b>Travel Times</b></div>';
          div.innerHTML += '<i style="background: #CC0000"> &nbsp; &nbsp;</i> &nbsp;>0-6 hours <br/>';
          div.innerHTML += '<i style="background: #FF0000"> &nbsp; &nbsp;</i> &nbsp;>6-12 hours <br/>';
          div.innerHTML += '<i style="background: #FF6600"> &nbsp; &nbsp;</i> &nbsp;>12-24 hours <br/>';
          div.innerHTML += '<i style="background: #FF9900"> &nbsp; &nbsp;</i> &nbsp;>24-36 hours <br/>';
          div.innerHTML += '<i style="background: #CCFF00"> &nbsp; &nbsp;</i> &nbsp;>36-48 hours <br/>';
          div.innerHTML += '<i style="background: #669900"> &nbsp; &nbsp;</i> &nbsp;>48 hours <br/>';
          div.innerHTML += '</div>';
  
          return div;
        }
        legend.addTo(map);
      }
    })    
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
        this.setPOI(evnt.latlng, 'response');
      } else {
        this.setPOI(evnt.latlng, 'planning');
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
      var direction;
      var intersection;
      this.sm('Point selected. Loading...');
      this.MapService.setCursor('');
      this.StudyService.SetWorkFlow('hasPOI', true);
      this.MapService.SetPoi(latlng);
      if (this.MapService.CurrentZoomLevel.value < 10 || !this.MapService.isClickable) { return; }
      if (inputString === 'response') {
        direction = 'downstream';
      } else {
        direction = 'upstream';
      }	  

      // MarkerMaker icon
      var blackPin = L.divIcon({className: 'wmm-pin wmm-black wmm-icon-circle wmm-icon-white wmm-size-25'});
      const marker = L.marker(latlng, {
        icon: blackPin
      });
      // add marker to map
      this.MapService.AddMapLayer({ name: 'POI', layer: marker, visible: true });

      this.NLDIService.GetRainDropPath(latlng.lat, latlng.lng, direction === 'downstream' ? 'down' : 'up')
        .toPromise().then(data => {
          if (data.outputs) {
            this.RDP = data.outputs[0].value.features;
            this.StudyService.selectedStudy.RDP = this.RDP;
            intersection = { coordinates: [this.RDP[0].properties.intersectionPoint[1], this.RDP[0].properties.intersectionPoint[0]], type: "Point"};
            if(direction === 'downstream') { //spill response workflow
              this.NavigationService.getNavigationResource('3')
                .toPromise().then(data2 => {
                  const config: Array<any> = data2.configuration;
                  config.forEach(item => {
                    switch (item.id) {
                      case 1: item.value = intersection;//marker.toGeoJSON().geometry;
                              item.value.crs = { properties: { name: 'EPSG:4326' }, type: 'name' };
                              break;
                      case 6: item.value = ['flowline', 'nwisgage']; // "flowline", "wqpsite", "streamStatsgage", "nwisgage"
                              break;
                      case 5: item.value = direction;
                              break;
                      case 0: if (this.StudyService.isMetric()) {
                                item.value = { id: 3, description: 'Limiting distance in kilometers from starting point', name: 'Distance (km)', value: this.StudyService.distance, valueType: 'numeric' };
                              } else {
                                var imp_distance = (this.StudyService.distance * 1.609344).toFixed(0); //converts miles to kilometers
                                item.value = { id: 3, description: 'Limiting distance in kilometers from starting point', name: 'Distance (km)', value: imp_distance, valueType: 'numeric' };
                              }
                    }// end switch
                  }); // next item
                  return config;
                }).then(config => {
                  this.NavigationService.getRoute('3', config, true).subscribe(response => {
                    this.NavigationService.navigationGeoJSON$.next(response);
                    response.features.shift();                
                    var rch1comid = this.RDP[0].properties.comid;
                    if(response.features[0].properties.nhdplus_comid === rch1comid) { //transfers clipped reach geometry to replace full reach geometry
                      response.features[0].geometry = this.RDP[0].geometry;
                    }
                    if(this.RDP.length > 1) {
                      response.features.unshift(this.RDP[1]);
                    }
                    response.features.forEach(element => {
                      element.properties.Length = turf.length(element, { units: 'kilometers' }); // computes actual length; (services return nhdplus length)
                    });
                    this.MapService.getFlowLineLayerGroup(response.features, inputString, this.StudyService.isMetric);
                    this.NWISService.check4gages(response.features);
                    this.StudyService.selectedStudy.Reaches = this.StudyService.formatReaches(response);
                    this.MapService.AddMapLayer({ name: 'Flowlines', layer: this.layerGroup, visible: true });
                    this.StudyService.SetWorkFlow('hasReaches', true);
                    this.StudyService.selectedStudy.LocationOfInterest = latlng;
                    this.StudyService.setProcedure(2);
                    //one with the biggest drainage area is the first one to trace up
                  });
                }).finally(() => {
                  if(this.RDP.length > 1) { 
                  this.wm('Travel time not computed for overland/raindrop trace portion', '', 0);
                  }
                });
            } else { // spill planning workflow
              this.NavigationService.getNavigationResource('3')
              .toPromise().then(data2 => {
                const config: Array<any> = data2.configuration;
                config.forEach(item => {
                  switch (item.id) {
                    case 1: item.value = intersection;//marker.toGeoJSON().geometry;
                            item.value.crs = { properties: { name: 'EPSG:4326' }, type: 'name' };
                            break;
                    case 6: item.value = ['flowline', 'nwisgage']; // "flowline", "wqpsite", "streamStatsgage", "nwisgage"
                            break;
                    case 5: item.value = "downstream";
                            break;
                    case 0: item.value = { id: 3, description: 'Grabs first reach with attributes', name: 'Distance (km)', value: 1, valueType: 'numeric' };
                  }// end switch
                }); // next item
                return config;
              }).then(config => {
                this.NavigationService.getRoute('3', config, true).subscribe(response => {
                  this.NavigationService.navigationGeoJSON$.next(response);
                  response.features.shift();
                  this.firstReach = response.features[0];
                  this.NavigationService.getNavigationResource('3')
                  .toPromise().then(data3 => {
                    const config2: Array<any> = data3.configuration;
                    config2.forEach(item => {
                      switch (item.id) {
                        case 1: item.value = intersection;//marker.toGeoJSON().geometry;
                                item.value.crs = { properties: { name: 'EPSG:4326' }, type: 'name' };
                                break;
                        case 6: item.value = ['flowline', 'nwisgage']; // "flowline", "wqpsite", "streamStatsgage", "nwisgage"
                                break;
                        case 5: item.value = direction;
                                break;
                        case 0: if (this.StudyService.isMetric()) {
                                  item.value = { id: 3, description: 'Grabs first reach with attributes', name: 'Distance (km)', value: (this.StudyService.distance).toFixed(0), valueType: 'numeric' };
                                } else {
                                  var imp_distance = (this.StudyService.distance * 1.609344).toFixed(0); //converts miles to kilometers
                                  item.value = { id: 3, description: 'Grabs first reach with attributes', name: 'Distance (km)', value: imp_distance, valueType: 'numeric' };
                                }
                      }// end switch
                    }); // next item
                    return config2;
                  }).then(config2 => {
                    this.NavigationService.getRoute('3', config2, true).subscribe(response2 => {
                      this.NavigationService.navigationGeoJSON$.next(response2);
                      response2.features.shift();                
                      var rch1comid = this.RDP[0].properties.comid;
                      if(this.firstReach.properties.nhdplus_comid === rch1comid) { //transfers clipped reach geometry to replace full reach geometry
                        this.firstReach.geometry = this.RDP[0].geometry;
                      }
                      if(this.RDP.length > 1 ) { //if overland flow trace exists
                        response2.features.unshift(this.RDP[1], this.firstReach);
                      } else { //if user point snapped to flowline
                        response2.features.unshift(this.firstReach);
                      }
                      response2.features.forEach(element => {
                        element.properties.Length = turf.length(element, { units: 'kilometers' }); // computes actual length; (services return nhdplus length)
                      });
                      this.StudyService.selectedStudy.spillPlanningResponse = response2;
                      this.StudyService.selectedStudy.LocationOfInterest = latlng;
                      this.NWISService.check4gages(this.StudyService.selectedStudy.spillPlanningResponse.features);
                      this.StudyService.SetWorkFlow('hasReaches', true);
                      this.openPlanningModal();
                      this.MapService.showUpstream.subscribe(data3 => {
                        if (data3) {
                          this.MapService.getFlowLineLayerGroup(this.StudyService.selectedStudy.spillPlanningResponse.features, inputString, this.StudyService.isMetric);
                          this.StudyService.selectedStudy.Reaches = this.StudyService.formatReaches(this.StudyService.selectedStudy.spillPlanningResponse);
                          this.MapService.AddMapLayer({ name: 'Flowlines', layer: this.layerGroup, visible: true });                  
                          this.StudyService.selectedStudy.LocationOfInterest = this.MapService.GetPOI();
                          this.StudyService.selectedStudy.LocationOfInterest = latlng;
                          this._showUpstream = data3;
                        } else {
                          this._showUpstream = data3;
                        }
                      })
                    })              
                  })
                  //one with the biggest drainage area is the first one to trace up
                });
              })
            }
          } else {
            this.em('NLDI Raindrop Trace Error, Please try a different location', '', 0);
            this.StudyService.SetWorkFlow('hasError', true);
          }
        }).catch((err) => {
          console.log('error: ', err.message);
          this.em('NLDI Raindrop Trace Failed, Please try again', '', 0);
          this.StudyService.SetWorkFlow('hasError', true);
        });
    }
  }

  private measure(latLon1, latLon2){  // generally used geo measurement function
    var lat1 = latLon1[1];
    var lon1 = latLon1[0];
    var lat2 = latLon2[1];
    var lon2 = latLon2[0];
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d; // kilometers
}

  private openPlanningModal(): void {
    if (this.isInsideWaterBody) {
      this.sm("Selected point of interest is inside of a water body.... please select different location")
    } else {
      const spillPlanningModalRef = this.modalService.open(SpillPlanningComponent);
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

  private wm(msg: string, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      if (timeout == 0) {
        options = {
          disableTimeOut : true,
          timeOut: 0,
          extendedTimeOut: 0,
          tapToDismiss: true
        };
      }
      this.messager.warning(msg, title, options);
    } catch (e) {
    }
  }

  private em(msg: string, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      if (timeout == 0) {
        options = {
          disableTimeOut : true,
          timeOut: 0,
          extendedTimeOut: 0,
          tapToDismiss: true
        };
      }
      this.messager.error(msg, title, options);
    } catch (e) {
    }
  }
  //#endregion

}

