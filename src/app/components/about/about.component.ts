import { Component, OnInit} from '@angular/core';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'aboutModal',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})

export class AboutModalComponent implements OnInit {

    public appVersion: string;
    public http: HttpClient;
    public version: string;

    constructor(http: HttpClient, config: NgbModalConfig, public activeModal: NgbActiveModal) {
      // customize default values of modals used by this component tree
      config.backdrop = 'static';
      config.keyboard = false;

      http.get("assets/data/config.json").subscribe(data => {
        var conf: any = data;
        this.version = conf.version;
      })
    }

     ngOnInit() {}

}
