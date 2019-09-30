import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet'
import * as esri from 'esri-leaflet';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import { MapService } from '../../services/map.services';
import { NavigationService } from '../../services/navigationservices.service';
import { StudyService } from '../../services/study.service';
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
	private StudyService: StudyService;

	private markers: L.Layer[] = [];
	//private results = [];
	private sites_upstream = [];
	private sites_downstream = [];
	private bounds: any = null;
	private marker_sites = [];
	private nodemarker = [];
	private mapReady: boolean = false;
    private methodType: string = null;

	private _layersControl;
	public get LayersControl(){
		return this._layersControl;
	}
	public get MapOptions(){
		return this.MapService.Options;
	}
	private _layers =[];
	public get Layers(){
		return this._layers;
	}
  
	constructor(mapservice:MapService, toastr: ToastrService, navservice:NavigationService) {
		super();
		this.messager = toastr;		  
		this.MapService = mapservice;	
		this.NavigationService = navservice  
	 } 

  ngOnInit() {

	  this.MapService.LayersControl.subscribe(data =>{
			this._layersControl ={
				baseLayers:data.baseLayers.reduce((acc, ml)=>
				{
					acc[ml.name] = ml.layer;
					return acc;
				},{}),
				overlays:data.overlays.reduce((acc, ml)=>{acc[ml.name] = ml.layer; return acc;},{})
			}
		});

		this.MapService.LayersControl.subscribe(data =>{		
			var activelayers =  data.overlays
								.filter((l: any) => l.visible)
								.map((l: any) => l.layer);
			activelayers.unshift(data.baseLayers.find((l: any) => (l.visible )).layer);	
			this._layers= activelayers;			
		});
	  

	// this.NavigationService.getNavigationResource("3")
	// .toPromise().then(data => {
	//   this.Site_reference = data['configuration'];
	// }); //get service {description: Initial description}
  //this.newFunc(); moving layers control to the sidebar
   }

	public onZoomChange(zoom: number) {	
		this.MapService.CurrentZoomLevel=zoom;
		this.MapService.ToggleLayerVisibility("Big Circle")
			
		this.sm("Zoom changed to "+ zoom);
	}

	public onMouseClick(evnt:any) {
		this.MapService.AddLayer(evnt.latlng);
		this.sm("Layer added to map!!!");

	}

	private setPOI(latlng: L.LatLng) {
		if (this.MapService.CurrentZoomLevel < 10) return;

		

        this.NavigationService.getNavigationResource("3")
        .toPromise().then(data => {
          //this.selectedStudy.POI = data['configuration'];
        }); //get service {description: Initial description}
    //this.newFunc(); moving layers control to the sidebar

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
