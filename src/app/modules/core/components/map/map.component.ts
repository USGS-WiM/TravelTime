import { Component, OnInit } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import { MapService } from '../../services/map.services';
import { deepCopy } from '../../../../shared/extensions/object.DeepCopy';
import { StudyService } from '../../services/study.service';
import { NavigationService } from '../../services/navigationservices.service';
import * as L from 'leaflet';
import { Study } from '../../models/study';


@Component({
  selector: "tot-map",
  templateUrl: "./map.component.html",
  styleUrls: ['./map.component.css'],
})

export class MapComponent extends deepCopy implements OnInit {

	private messager: ToastrService;
	private MapService: MapService;
	private NavigationService: NavigationService;
	private StudyService: StudyService;
  private _layersControl;
  private _layers = [];

  public get LayersControl() {
    return this._layersControl;
  }
  public get MapOptions() {
    return this.MapService.Options;
  }
  public get Layers() {
    return this._layers;
  }

  constructor(mapservice: MapService, navigationservice: NavigationService, toastr: ToastrService, studyservice: StudyService) {
    super();
    this.messager = toastr;
    this.MapService = mapservice;
    this.NavigationService = navigationservice;
    this.StudyService = studyservice;
  }

  ngOnInit() {

    //method to subscribe to the layers
    this.MapService.LayersControl.subscribe(data => {
      this._layersControl = {
        baseLayers: data.baseLayers.reduce((acc, ml) => {
          acc[ml.name] = ml.layer;
          return acc;
        }, {}),
        overlays: data.overlays.reduce((acc, ml) => { acc[ml.name] = ml.layer; return acc; }, {})
      }
    });

    //method to filter out layers by visibility
    this.MapService.LayersControl.subscribe(data => {
      var activelayers = data.overlays
        .filter((l: any) => l.visible)
        .map((l: any) => l.layer);
      activelayers.unshift(data.baseLayers.find((l: any) => (l.visible)).layer);
      this._layers = activelayers;
    });

    // this.StudyService.WorkFlowControl.subscribe(data => {
    //   this._workflow = data;
    // })
  }

  public onZoomChange(zoom: number) {
    this.MapService.CurrentZoomLevel = zoom;
    //this.MapService.SetOverlay("Big Circle")
    this.sm("Zoom changed to " + zoom);
  }

  public onMouseClick(evnt: any) { 
    if(this.StudyService.GetWorkFlow("hasMethod")) {
      (<HTMLInputElement> document.getElementById(this.StudyService.selectedStudy.MethodType)).disabled = true;
      this.setPOI(evnt.latlng);
      this.sm("Layer added to map!!!");
    }
    
  }

  //#region "Helper methods"
  private setPOI(latlng: L.LatLng) {
    this.StudyService.SetWorkFlow("hasPOI", true);
    if (this.MapService.CurrentZoomLevel < 10 || !this.MapService.isClickable) return;
    let marker = L.marker(latlng);
    //add marker to map
		this.MapService.AddMapLayer({name: "POI", layer: marker, visible: true});
    this.NavigationService.getNavigationResource("3")
    .toPromise().then(data => {
      let config: Array<any> = data['configuration'];
      config.forEach(item =>{
        switch(item.id){
          case 1: item.value = marker.toGeoJSON().geometry;
            item.value["crs"] = {"properties":{"name":"EPSG:4326"},"type":"name"};
            break;
          case 6: item.value = ["flowline", "nwisgage"];
            break;
          case 5: item.value = "downstream";
            break;
          case 0: item.value = {id: 3, description: "Limiting distance in kilometers from starting point", name: "Distance (km)", value: 10, valueType: "numeric"};
        }//end switch
      });//next item
      return config;
    }).then(config =>{
      this.NavigationService.getRoute("3",config,true).subscribe(response => {
        this.StudyService.selectedStudy.Reaches = this.formatReaches(response);
        this.StudyService.SetWorkFlow("hasReaches", true);
        this.StudyService.selectedStudy.LocationOfInterest = latlng;
      });
    }) //get service {description: Initial description}
    //this.newFunc(); moving layers control to the sidebar
  }
  
  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) options = { timeOut: timeout };

      this.messager.show(msg, title, options, mType)
    }
    catch (e) {
    }
  }

  private formatReaches(data) {
    let streamArray = [];
    while (streamArray.length != 0) {
      streamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) {
      if (data['features'][i].geometry['type'] == 'LineString') { //if type of point, add marker
        var polylinePoints = this.deepCopy(data['features'][i]); //what is this doing?
        streamArray.push(polylinePoints);
      }
    }
    return (streamArray);
  }
  //#endregion

}
