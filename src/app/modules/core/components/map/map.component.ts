import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet'
import * as esri from 'esri-leaflet';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import { MapService } from '../../services/map.services';
import { NavigationService } from '../../services/navigationservices.service';
import { StudyAreaService } from '../../services/studyArea.service';
import {site} from '../../models/site';
import { parameter } from '../../models/parameter';
import { deepCopy } from '../../../../shared/extensions/object.DeepCopy';


@Component({
  selector: "tot-map",
  templateUrl: "./map.component.html",
  styleUrls: ['./map.component.css'],
})

export class MapComponent extends deepCopy implements OnInit {

	private messager: ToastrService;
	private MapService: MapService;
	private NavigationService: NavigationService;
	private StudyAreaService: StudyAreaService;
	private markers: L.Layer[] = [];
	private Site_reference: site;
	//private results = [];
	private sites_upstream = [];
	private sites_downstream = [];
	private bounds: any = null;
	private marker_sites = [];
	private nodemarker = [];
	private mapReady: boolean = false;
  private methodType: string = null;


	public get LayersControl(){
    return this.MapService.layersControl;
  }

  public get MapOptions() {
    return this.MapService.options;//this.MapService.options;
  }

  public onMapReady(map: L.Map) {
    this.MapService.onMapReady(map);
  }

  ngOnInit() {

    this.NavigationService.getNavigationResource("3")
      .toPromise().then(data => {
        this.Site_reference = data['configuration'];
      });

    //this.newFunc(); moving layers control to the sidebar
  }


  /*options = {
    layers: this.MapService.layer,//L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    zoom: 10,
    center: L.latLng(46.95, -122)
  };*/

	constructor(mapservice:MapService, toastr: ToastrService) {
		super();
		this.messager = toastr;		  
    this.MapService = mapservice;
	 }

	public onZoomChange(zoom: number) {	
		this.MapService.CurrentZoomLevel=zoom;
		this.sm("Zoom changed to "+ zoom);
	}
	//public onMouseClick(evnt:any) {

	public addMarker(e) {
		if (this.MapService.CurrentZoomLevel > 9 && this.mapReady === true) {
			let mySpill = new site([this.Site_reference]);
			if (this.markers.length > 0) {
				while (this.markers.length != 0) {
					this.markers.splice(0, 1)
				}
			}
			/* const marker = L.marker(e.latlng.lat, e.latlng.lng), {
				draggable: true,
				autoPan: true,
				icon: L.icon({
					iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
					iconSize: [25, 41],
					iconAnchor: [12, 41],
					popupAnchor: [1, -34],
					shadowSize: [41, 41]
				})
			}).on('click', this.swapElement(mySpill['mylist'], 2, 3));
			//L.DomUtil.removeClass(this.map._container, 'crosshair-cursor-enabled');
			this.mapReady = false;
			this.markers.push(marker);
			//this.checkZoom(this.map.getZoom())//, this.markers)
			this.StudyAreaService.setSelectedStudyArea(this.markers);
			//this.MapService.result = mySpill;
			if (this.methodType === "downstream") {
				let mySite = mySpill;
				let e = this.StudyAreaService.spillLocation.getLatLng();
				this.MarkerClick(mySite['mylist'], e.lat, e.lng, 'downstream', ['streamStatsgage', 'flowline'], 1000);
				//this.barButtonOptions_downstream.active = true;
			} else if (this.methodType === "upstream") {
				let mySite = mySpill;
				let e = this.StudyAreaService.spillLocation.getLatLng();
				this.MarkerClick(mySite['mylist'], e.lat, e.lng, 'upstream', ['streamStatsgage'], 1000);
				//this.barButtonOptions_upstream.active = true;
			} */
		} else { }
	}

	public MarkerClick(e, lat, lng, cond, option, len) {
		e[0]['value']['coordinates'] = [lng, lat]; // add lat long
		e[1]['value'] = cond;
		e[3]['value'] = option;
		//for upstream only
		if (e[2].value instanceof Array) { //if array, set limit of 100, copy parameters into a tuple, else do nothing since it should be already set
		  e[2].value[0].value = len;
		  e[2].value.splice(1, 1);
		  let myvar = new parameter(e[2].value[0]);
		  e[2].value = myvar;
		}
	
		/* this.NavigationService.getRoute("networktrace",e)
		  .toPromise().then(data => {
			let myreturn;
			let polyline;
			if (cond == 'upstream') {
			  myreturn = this.MapService.getUpstream(data);
			  //this.barButtonOptions_upstream.active = false;
			} else {
			  myreturn = this.MapService.getDownstream(data);
			  var myStyle = {
				"color": "#FF3333",
				"weight": 3,
				"opacity": 0.60
			  }
			  this.MapService.addPolyLine(data);
			  polyline = L.geoJSON(this.MapService.streamArray, { style: myStyle });
			  if (typeof polyline === 'undefined') { } else {
				this.markers.push(polyline);
			  }
			}
			this.markers.push(myreturn);
			this.barButtonOptions_downstream.active = false;
			this.barButtonOptions_downstream.disabled = true;
			var group = L.featureGroup(this.markers);
			this.map.fitBounds(group.getBounds());
			for (var i = 0; i < this._MapService.lastnode.length; i++) {
			  this.markers.push(this._MapService.lastnode[i])
			}
			this.setStep(2);
		  })
		  .catch((err) => {
			console.log("error: ", err.message);
			this.sendAlert(err, "Navigation Services");
			this.barButtonOptions_downstream.active = false;
			this.barButtonOptions_downstream.buttonColor = 'primary';
			this.markers = [];
		  });
		}; */
	
	
	/* sendAlert(err, serv) {
		let data = {};
		data = {
		  //reason: error && error.error.reason ? error.error.reason : '',
		  status: err.status,
		  url: err.url,
		  service: serv
		};
		this.errorDialogService.openDialog(data);
		
		this.sm("Mouse click "+ evnt.latlng.lat +" "+ evnt.latlng.lng); */
	}
	//#region "Helper methods"
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
