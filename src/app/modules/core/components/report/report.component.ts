import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudyService } from '../../services/study.service';
import { reach } from '../../models/reach';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { MapService } from '../../services/map.services';
import { TravelTimeService } from '../../services/traveltimeservices.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Study } from '../../models/study';
import { MapComponent } from '../map/map.component';
import { Angulartics2 } from 'angulartics2';
import * as L from 'leaflet';

@Component({
  selector: 'tot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportModalComponent implements OnInit {

  private StudyService: StudyService;
  private MapService: MapService;
  private TravelTimeService: TravelTimeService;
  private reaches: reach[];
  private reach_reference: reach;
  private _layersControl;
  private _layers = [];

  private optionsSpec: any = {
    layers: [{ url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: 'Open Street Map' }],
    zoom: 5,
    center: [46.879966, -121.726909]
  };

  public reportTitle = "Time of Travel Report";
  public reportComments = "";
 
  public get LayersControl() {
    return this._layersControl;
  }

  public get MapOptions() {
    return this.MapService.Options;
  }

  // Leaflet bindings
  public zoom = this.optionsSpec.zoom;
  public center = L.latLng(this.optionsSpec.center);
  public options = {
    layers: [L.tileLayer(this.optionsSpec.layers[0].url, { attribution: this.optionsSpec.layers[0].attribution })],
    zoom: this.optionsSpec.zoom,
    center: L.latLng(this.optionsSpec.center)
  };

  public get Layers() {
    return this._layers;
  }

  public units;
  public abbrev;
  public fitBounds;
  public evnt;

  public get output$ () {
    if (this.StudyService.GetWorkFlow('totResults')) {
      return (this.reaches);
    } else {
      return;
    }
  }
  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal, studyservice: StudyService, mapservice: MapService, traveltimeservice: TravelTimeService, private angulartics2: Angulartics2) { 
    config.backdrop = 'static';
    config.keyboard = false;
    this.StudyService = studyservice;
    this.MapService = mapservice;
    this.TravelTimeService = traveltimeservice;
    this.angulartics2.eventTrack.next({
      action: 'myAction',
      properties: { category: 'myCategory' }
    });
  }

  ngOnInit() {
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

    this.units = this.MapService.unitsOptions;
    this.abbrev = this.MapService.abbrevOptions;
    let reachList = Object.values(this.StudyService.selectedStudy.Results['reaches']);
      reachList.shift(); //remove first element (one without results)

      this.checkUnits(reachList);
  }

  public onMapReady(map: L.Map) {
    map.invalidateSize ()
  }

  public onZoomChange(zoom: number) {
    setTimeout(() => {
      this.MapService.CurrentZoomLevel = zoom;
    })
    // this.sm("Zoom changed to " + zoom);
  }

  public onMouseClick(evnt: any) { //need to create a subscriber on init and then use it as main poi value;

    this.evnt = evnt.latlng;
  }

  public onPrint() {
    window.print();
  }

  public downloadCSV() {
    this.angulartics2.eventTrack.next({ action: 'Download', properties: { category: 'Report', label: 'CSV' }});
    var filename = 'data.csv';

    var processTables = () => {
      var finalVal = 'Traveltime Results\n';
      finalVal += this.tableToCSV($('#MostProbTableDL'));
      finalVal += '\n' + this.tableToCSV($('#MaxProbTableDL'));
      return finalVal + '\r\n';
    };

    //main file header with site information
    var csvFile = 'Traveltime Report\n\n' + 'Spill Mass of ' + this.StudyService.selectedStudy.SpillMass + ' occurring ' + this.StudyService.selectedStudy.SpillDate + '\nLocated at ' + this.StudyService.selectedStudy.LocationOfInterest.lat + '\, ' + this.StudyService.selectedStudy.LocationOfInterest.lng + '\n';
    //first write main parameter table
    csvFile += processTables();

    //download
    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = <any>document.createElement("a");
        var url = URL.createObjectURL(blob);
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else {
            window.open(url);
        }
      }
  }

  private tableToCSV($table) {
    var $headers = $table.find('tr:has(th)')
        , $rows = $table.find('tr:has(td)')

        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        , tmpColDelim = String.fromCharCode(11) // vertical tab character
        , tmpRowDelim = String.fromCharCode(0) // null character

        // actual delimiter characters for CSV format
        , colDelim = '";"'
        , rowDelim = '"\r\n"';

    // Grab text from table into CSV formatted string
    var csv = '"';
    csv += formatRows($headers.map(grabRow));
    csv += rowDelim;
    csv += formatRows($rows.map(grabRow)) + '"';
    return csv

    //------------------------------------------------------------
    // Helper Functions 
    //------------------------------------------------------------
    // Format the output so it has the appropriate delimiters
    function formatRows(rows) {
        return rows.get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim);
    }

    // Grab and format a row from the table
    function grabRow(i, row) {

        var $row = $(row);
        //for some reason $cols = $row.find('td') || $row.find('th') won't work...
        var $cols = $row.find('td');
        if (!$cols.length) $cols = $row.find('th');

        return $cols.map(grabCol)
            .get().join(tmpColDelim);
    }

    // Grab and format a column from the table 
    function grabCol(j, col) {
        var $col = $(col),
            $text = $col.text();

        return $text.replace('"', '""'); // escape double quotes

    }
}
  
  private checkUnits(reaches) {
    if(!this.StudyService.isMetric()) {
      let tempreaches = [];

      for (var i = 0; i < reaches.length; i++) { 
          let newreach = reaches[i]; //copy jobson output for reach i to newreach

          newreach.parameters[1].value = (reaches[i].parameters[1].value * 35.314666212661).toUSGSvalue();     //real-time discharge from cms to cfs
          newreach.parameters[0].value = (reaches[i].parameters[0].value * 35.314666212661).toUSGSvalue();     //mean annual discharge from cms to cfs
          newreach.parameters[3].value = (reaches[i].parameters[3].value * 0.00000038610215855).toUSGSvalue(); //drainage area from square meters to square miles
          newreach.parameters[4].value = (reaches[i].parameters[4].value * 0.00062137).toUSGSvalue();              //length from meters to miles 
          if(newreach.parameters[7]) {  newreach.parameters[7].value = (reaches[i].parameters[7].value * 0.00062137).toUSGSvalue(); }             //cumulative length from meters to miles
          if(newreach.parameters[6]) {  newreach.parameters[6].value = (reaches[i].parameters[6].value * 0.0000022046).toUSGSvalue(); }            //spill mass from milligrams to pounds

          newreach.parameters[0].unit.unit = this.units.imperial['discharge']                    //mean annual discharge
          newreach.parameters[0].unit.abbr = this.abbrev.imperial['discharge']
          newreach.parameters[1].unit.unit = this.units.imperial['discharge']                    //real-time discharge
          newreach.parameters[1].unit.abbr = this.abbrev.imperial['discharge']
          newreach.parameters[2].unit.unit = this.units.imperial['slope']                        //slope
          newreach.parameters[2].unit.abbr = this.abbrev.imperial['slope']
          newreach.parameters[3].unit.unit = this.units.imperial['drainageArea']                 //drainage area
          newreach.parameters[3].unit.abbr = this.abbrev.imperial['drainageArea']
          newreach.parameters[4].unit.unit = this.units.imperial['distance']                     //reach length
          newreach.parameters[4].unit.abbr = this.abbrev.imperial['distance']
          if(newreach.parameters[7]) { newreach.parameters[7].unit.unit = this.units.imperial['distance'] }                  //cumulative length
          if(newreach.parameters[7]) { newreach.parameters[7].unit.abbr = this.abbrev.imperial['distance'] }
          if(newreach.parameters[6]) { newreach.parameters[6].unit.unit = this.units.imperial['concentration'] }               //spill mass
          if(newreach.parameters[6]) { newreach.parameters[6].unit.abbr = this.abbrev.imperial['concentration'] }

          newreach.result.equations.vmax.value = (reaches[i].result.equations.vmax.value * 3.2808399).toUSGSvalue(); //m/s to ft/s
          newreach.result.equations.v.value = (reaches[i].result.equations.v.value * 3.2808399).toUSGSvalue(); //m/s to ft/s

          newreach.result.equations.vmax.units = this.abbrev.imperial['velocity']
          newreach.result.equations.v.units = this.abbrev.imperial['velocity']
          
          tempreaches.push(newreach);
          console.log(i);
      }
      this.StudyService.selectedStudy.SpillMass = (this.StudyService.selectedStudy.SpillMass * 0.453592).toUSGSvalue();
      this.reaches = tempreaches;
      console.log(this.reaches);
    } else {
      this.reaches = reaches;
    } //keep existing metric units        
  }
  private printElement(elem) {
      var domClone = elem.cloneNode(true);
      
      var $printSection = document.getElementById("printSection");
      
      if (!$printSection) {
          var $print = document.createElement("div");
          $print.id = "printSection";
          document.body.appendChild($print);
      }
      
      $printSection.innerHTML = "";
      $printSection.appendChild(domClone);
      window.print();
  }
}
