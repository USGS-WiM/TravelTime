import { Injectable } from '@angular/core';
import { latLng, tileLayer, Layer } from 'leaflet';
import * as L from "leaflet";
import { myfunctions } from '../shared/myfunctions'; 
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { catchError, retry } from 'rxjs/operators';

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
  getUpstream (data) {
    while (this.gagesUpstreamArray.length != 0) {
      this.gagesUpstreamArray.splice(0, 1)
    }
    for (var i = 1; i < data['features'].length; i++) { //first one is the user selected site
      var gagesUpstream = this.deepCopy(data['features'][i]);
      var d = new Date(); // for now
      //console.log (d.getFullYear ())
      //console.log (d.getMonth ())
      //console.log (d.getDate ())
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

  public gageFlag = 0;

  getInstantFlow(USGSID, date) {
    var myurl = "https://nwis.waterdata.usgs.gov/nwis/uv?cb_00060=on&cb_00065=on&format=rdb&site_no=" + USGSID + "&period=&begin_date=" + date + "&end_date=" + date;
    return (this.http.get<any>(myurl)
      .pipe(
        retry(3)//,
        //catchError(this.handleError)
    )
      );
  }
  //get downstream data from the marker
  getDownstream(data) {

    function whenClicked(e) {
      var numb = e.target.feature.properties.identifier;
      numb = numb.match(/\d/g);
      numb = numb.join("");
      if (typeof this.spill_date === 'undefined') { } else {
        this.getInstantFlow(numb, this.spill_date);
      }
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
      onEachFeature: onEachFeature,
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
        });
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

}
