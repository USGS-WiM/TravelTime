import { Component, OnInit, Input} from '@angular/core';
import {GetTimeoftravelService} from '../services/get-timeoftravel.service';

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.css']
})

export class ContentsComponent implements OnInit {

  @Input () ini_mass;
  @Input () ini_time;

  constructor(
    private _GetTimeoftravelService: GetTimeoftravelService
  ) { }

  ngOnInit() {
  }


  onClick_edit (){
    //const findReach = this.mylist.find();
    //console.log (findReach);
  }
  
}
