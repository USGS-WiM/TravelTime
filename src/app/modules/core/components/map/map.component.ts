import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet'
import * as esri from 'esri-leaflet';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from "../../../../shared/messageType";
import {MapService} from '../../services/map.services'


@Component({
  selector: "tot-map",
  templateUrl: "./map.component.html",
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit {

	private messanger:ToastrService;
	private MapService:MapService;

	public get LayersControl(){
		return this.MapService.layersControl;
	}
	public get MapOptions(){
		return this.MapService.options;
	}
	public get Layers(){
		return this.MapService.ActiveLayers;
	}
	
  
	constructor(mapservice:MapService, toastr: ToastrService) {
	  this.messanger = toastr;
	  this.MapService=mapservice;
	 }

  ngOnInit() {

	 
  }

	public onZoomChange(zoom: number) {	
		
		this.sm("Zoom changed to "+ zoom);
	}
	public onMouseClick(evnt:any) {
		
		this.sm("Mouse click "+ evnt.latlng.lat +" "+ evnt.latlng.lng);
	}


	

	//#region "Helper methods"
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
