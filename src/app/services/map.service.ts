import { Injectable } from '@angular/core';
import { latLng, tileLayer, Layer } from 'leaflet';
import * as L from "leaflet";
import { myfunctions } from '../shared/myfunctions'; 
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { catchError, retry } from 'rxjs/operators';
import { measurements } from '../site';
//import fs from 'fs';

@Injectable({
  providedIn: 'root'
})

export class MapService extends myfunctions {

  public result;
  public myPoint;
  public layersControl;
  public streamLine: Layer[] = [];
  public streamArray = [];
  public gagesUpstreamArray = [];
  public gagesDownstreamArray = [];
  public lastnode = [];
  public spill_date: string;
  public diag;

  constructor(
    private http: HttpClient,
    public dialog: MatDialog
  ) {
    super()
  }


  //get upstream data from the marker
  getUpstream(data) {
    while (this.gagesUpstreamArray.length != 0) {
      this.gagesUpstreamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) { //first one is the user selected site
      var gagesUpstream = this.deepCopy(data['features'][i]);
      var d = new Date(); // for now
      this.gagesUpstreamArray.push(gagesUpstream);
    }

    function whenClicked(e) {
      // e = event
      console.log(e);
      // You can make your ajax call declaration here
      //$.ajax(... 
    }

    function onEachFeature(feature, layer) {
      // does this feature have a property named 'name, comid,uri, source'?
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.comid + " " + feature.properties.name + " " + feature.properties.uri + " " + feature.properties.source);
        layer.on({
          click: whenClicked
        });
      }
    };


    var gagesUpstream = L.geoJSON(this.gagesUpstreamArray, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })

        });
      }
    });
    return (gagesUpstream);
  };

  siteinfo;
  public gageFlag = 0;

  flows = [];

  getInstantFlow() {
    var myurl = "https://waterdata.usgs.gov" + "/nwis/uv?cb_00060=on&format=rdb&site_no=" + this.statid + "&period=&begin_date=" + this.spill_date + "&end_date=" + this.spill_date;
    this.http.get(myurl, { responseType: 'text' })
      .subscribe((data) => {
        var i = 0;
        var arraylist = [];

        for (const line of data.split(/[\r\n]+/)) {
          if (i > 27) {
            this.flows.push(line);
            var ar = line.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; }); // split string on comma space
            //console.log(ar);
            var flow = new measurements([ar[3], ar[5]]);
            arraylist.push(flow);
          }
          i = i+1;
        }
        console.log(arraylist); //can be returned to the modal component
      });
  }

  statid: string;
  //get downstream data from the marker
  getDownstream(data) {

    while (this.gagesDownstreamArray.length != 0) {
      this.gagesDownstreamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) { //first one is the user selected site
      if (data['features'][i].geometry['type'] == 'Point') { //if type of point, add marker
        var gagesDownstream = this.deepCopy(data['features'][i]);
        this.gagesDownstreamArray.push(gagesDownstream);
      }
    }

    var gagesDownstream = L.geoJSON(this.gagesDownstreamArray, {
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          console.log(feature);
          layer.bindPopup(feature.properties.comid + " " + feature.properties.name + " " + feature.properties.uri + " " + feature.properties.source);
          layer.on({
            'click': (e) => {
              var statid = e.target.feature.properties.identifier;
              this.statid = statid.match(/\d/g).join("");

              this.getInstantFlow();
            }
          });
        }
      },
      pointToLayer: function (feature, latlng) {
        const marker = new L.marker(latlng, {
          icon: L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        })
        return marker;
      }
    });
    return (gagesDownstream);
  };



  //add polyline downstream
  addPolyLine(data) {
    while (this.streamArray.length != 0) {
      this.streamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) {
      if (data['features'][i].geometry['type'] == 'LineString') { //if type of point, add marker
        var polylinePoints = this.deepCopy(data['features'][i]); //not implemented yet (services - for discussion tomorrow)
        this.streamArray.push(polylinePoints);
        var temppoint = polylinePoints.geometry.coordinates[polylinePoints.geometry.coordinates.length - 1]
        if (typeof polylinePoints.properties.nhdplus_comid === 'undefined') { } else {
          const marker = new L.circle([temppoint[1], temppoint[0]], {
            color: 'orange',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 100
          }).bindPopup(
            'Reach COMID ' + polylinePoints.properties.nhdplus_comid
          );
            this.lastnode.push(marker)
        }
      }
    }
    return (this.streamArray);
  }

  clear() {
    this.gagesDownstreamArray = [];
    this.gagesUpstreamArray = [];
    this.streamArray = [];
  }

}
