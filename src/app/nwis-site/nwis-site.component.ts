import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { measurements } from '../site';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-nwis-site',
  templateUrl: './nwis-site.component.html',
  styleUrls: ['./nwis-site.component.css']
})

export class NwisSiteComponent implements OnInit {

  public nwis_flow = [measurements];

  constructor(public _MapService: MapService) { }

  ngOnInit() {
    //for (var i = 0; i < this._MapService.getInstantFlow().length; i++) {
      
    //}
    this.nwis_flow
  }

}
