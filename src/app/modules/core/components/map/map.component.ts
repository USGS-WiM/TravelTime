import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import { MapService } from '../../services/map.services';
import { deepCopy } from '../../../../shared/extensions/object.DeepCopy';
import { StudyService } from '../../services/study.service';
import { NavigationService } from '../../services/navigationservices.service';
import * as L from 'leaflet';
import { Study } from '../../models/study';
import * as turf from '@turf/turf';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

@Component({
  selector: "tot-map",
  templateUrl: "./map.component.html",
  styleUrls: ['./map.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '60vh'
      })),
      state('out', style({
        height: '100vh'
      })),
      state('report', style({
        height: '25vh'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})

export class MapComponent extends deepCopy implements OnInit {

	private messager: ToastrService;
	private MapService: MapService;
	private NavigationService: NavigationService;
	private StudyService: StudyService;
  private _layersControl;
  private _bounds;
  private _layers = [];
  private subscription: Subscription;
  public fitBounds;

  @Input() public modal: boolean;
  
  scaleMap: string;

  public get LayersControl() {
    return this._layersControl;
  }

  public get MapOptions() {
    return this.MapService.Options;
  }

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
    center: L.latLng(this.optionsSpec.center)
  };

  public get Layers() {
    return this._layers;
  }


  constructor( private zone: NgZone, mapservice: MapService, navigationservice: NavigationService, toastr: ToastrService, studyservice: StudyService) {
    super();
    this.messager = toastr;
    this.MapService = mapservice;
    this.NavigationService = navigationservice;
    this.StudyService = studyservice;
  }


  ngOnInit() {
    if(!this.modal) {
      this.scaleMap = 'out';
      this.StudyService.noticeAction(false);

      this.subscription = this.StudyService.return$.subscribe(isWorking => {
        if (isWorking) {
          this.scaleMap = 'in';
        }
      });
    } 
    else {
      this.scaleMap = 'report';
    }

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

    this.MapService.fitBounds.subscribe(data => {
      this.fitBounds = data;
    })
  }



  public onMapReady(map: L.Map) {
    map.invalidateSize ()
  }

  public onZoomChange(zoom: number) {
    setTimeout(() => {
      this.MapService.CurrentZoomLevel = zoom;
    })
    this.sm("Zoom changed to " + zoom);
  }

  public onMouseClick(evnt: any) {
    if (this.StudyService.GetWorkFlow("hasMethod")) {
      (<HTMLInputElement>document.getElementById(this.StudyService.selectedStudy.MethodType)).disabled = true;
      this.setPOI(evnt.latlng);
      this.sm("Layer added to map!!!");
      this.MapService.setCursor("");
    }
  }



  //#region "Helper methods"
  private setPOI(latlng: L.LatLng) {
    this.StudyService.SetWorkFlow("hasPOI", true);
    if (this.MapService.CurrentZoomLevel < 10 || !this.MapService.isClickable) return;
    let marker = L.marker(latlng, {
      icon: L.icon(this.MapService.markerOptions.Spill)
    });
    //add marker to map
    this.MapService.AddMapLayer({ name: "POI", layer: marker, visible: true });

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
          case 0: item.value = { id: 3, description: "Limiting distance in kilometers from starting point", name: "Distance (km)", value: this.StudyService.distance, valueType: "numeric" };
        }//end switch
      });//next item
      return config;
    }).then(config =>{
      this.NavigationService.getRoute("3", config, true).subscribe(response => {

        response.features.shift();
        var layerGroup = new L.LayerGroup([]);//streamLayer
        var r = 0;
        response.features.forEach(i => {
          if (i.geometry.type === 'Point') {
            var gage = L.marker([i.geometry.coordinates[1], i.geometry.coordinates[0]], { icon: L.icon(this.MapService.markerOptions.GagesDownstream) })
            layerGroup.addLayer(gage);
          } else if (typeof i.properties.nhdplus_comid === "undefined") {
          } else {
            var nhdcomid = String(i.properties.nhdplus_comid);
            var temppoint = i.geometry.coordinates[i.geometry.coordinates.length - 1]
            //var marker = L.circle([temppoint[1], temppoint[0]], this.MapService.markerOptions.EndNode).bindPopup(nhdcomid);
            //layerGroup.addLayer(marker);
            layerGroup.addLayer(L.geoJSON(i, this.MapService.markerOptions.Polyline));
            r += 1;
            if (r === 1) {
              i.properties.Length = turf.length(i, { units: "kilometers" });//computes actual length; (services return nhdplus length)
            }
          }
        });
        this.StudyService.selectedStudy.Reaches = this.formatReaches(response);
        //console.log(this.StudyService.selectedStudy.Reaches);

        this.MapService.AddMapLayer({ name: "Flowlines", layer: layerGroup, visible: true });
        this.StudyService.SetWorkFlow("hasReaches", true);
        this.StudyService.selectedStudy.LocationOfInterest = latlng;
        this.StudyService.setProcedure(2);

      });
    })
  }
  
  private sm(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) options = { timeOut: timeout };
      setTimeout(() =>
      this.messager.show(msg, title, options, mType))
    }
    catch (e) {
    }
  }

  private formatReaches(data): any {
    let streamArray = [];
    for (var i = 0; i < data['features'].length; i++) {
      if (data['features'][i].geometry['type'] == 'LineString') { //if type of point, add marker
        var polylinePoints = this.deepCopy(data['features'][i]); //what is this doing?
        streamArray.push(polylinePoints);
      }
    }
    streamArray.map((reach) => {
      reach.properties.show = false;
    })
    return(streamArray);
  }

  //#endregion

}
