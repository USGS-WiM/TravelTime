import { Component, OnInit } from '@angular/core';
import { GetTimeoftravelService } from '../services/get-timeoftravel.service';
import { reach } from '../reach';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {

  mylist = [];
  reach_reference: reach;
  ini_mass: number;
  ini_time: number;
  new_reach: reach;
  output: {};

  constructor(
    private _GetTimeoftravelService: GetTimeoftravelService //services
  ) { }

  ngOnInit(): any {   //on init, get the services for first reach, and add them as parameters to accordion
    this._GetTimeoftravelService.getReach() // get reach
      .subscribe(data => this.reach_reference = data); //get service {description: Initial description}
    this.new_reach = this.reach_reference;
  }

  onClick_addReach() {   //add class jobson to an array of items that has been iterated over on ui side
    let newreach = new reach(this.reach_reference); //new Jobson reaches object that will store initial object
    this.mylist.push(newreach);    //push the object to the array of reaches
  };

  onClick_removeReachLast() {  //remove last reach
    this.mylist.pop();
  }


  onClick_removeReach(index) {   //remove reach by id
    if (index >= 0) {
      this.mylist.splice(index, 1);
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }


  onClick_postReach() {
    this._GetTimeoftravelService.postReach(this.mylist, this.ini_mass, this.ini_time)
      .subscribe(data => this.output = data);
  }

}
