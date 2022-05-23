import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

declare var opr: any;
declare var InstallTrigger: any;

@Component({
  selector: 'helpModal',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})

export class HelpModalComponent implements OnInit {

  public appVersion: string;
  public http: HttpClient;
  public version: string;
  public freshdeskCredentials;
  public WorkspaceID: string;
  public RegionID: string;
  public Server: string;
  private file: File | null = null;
  public newTicketForm: FormGroup;
  public Browser: string;
  private messager: ToastrService;

  constructor(http: HttpClient, config: NgbModalConfig, public activeModal: NgbActiveModal, public fb: FormBuilder, toastr: ToastrService, ) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.messager = toastr;

    http.get("assets/data/secrets.json").subscribe(data => {
      this.freshdeskCredentials = data;
    })

    http.get("assets/data/config.json").subscribe(data => {
      var conf: any = data;
      this.version = conf.version;
    })

    this.newTicketForm = fb.group({
        'email': new FormControl(null, Validators.required),
        'subject': new FormControl(null, Validators.required),
        'description': new FormControl(null, Validators.required),
        'attachment': new FormControl(null)
    });
  }

  ngOnInit() {
    this.getBrowser();
  }

  async submitFreshDeskTicket() {
    //this.freshdeskCredentials = await this.http.get('assets/data/secrets.json').toPromise()
    var url = "https://streamstats.freshdesk.com/api/v2/tickets"

    // need formdata object to send file correctly
    var formdata = new FormData();
    formdata.append('status', "2"); 
    formdata.append('tags[]', 'NSS');  
    formdata.append('[custom_fields][browser]', this.Browser);
    formdata.append('[custom_fields][softwareversion]', this.appVersion);

    if (this.file){
        // if file was uploaded, add to form data
        formdata.append('attachments[]', this.file, this.file.name);
    }
    
    // read form values from html
    const formVal = this.newTicketForm.value;

    formdata.append('subject', formVal.subject);
    formdata.append('email', formVal.email);
    formdata.append('description', formVal.description);

    const headers: HttpHeaders = new HttpHeaders({
        "Authorization": "Basic " + btoa(this.freshdeskCredentials.Token + ":" + 'X')
    });
    // delete content type so webkit boundaries don't get added
    headers.delete('Content-Type');

    this.http.post<any>(url, formdata, { headers: headers, observe: "response"}).subscribe(
        (res) => {
          this.message('Ticket was created', 'info', '', 0);
          this.cancelHelp();
        },(error) => {
          this.message('Error creating ticket', 'error', '', 0);
        }
    ); 
  }

  private getBrowser() {
    //modified from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    // Opera 8.0+
    if ((!!(<any>window).opr && !!opr.addons) || !!(<any>window).opera || navigator.userAgent.indexOf(' OPR/') >= 0) this.Browser = "Opera";
    // Firefox 1.0+
    if (typeof InstallTrigger !== 'undefined') this.Browser = "Firefox";
    // At least Safari 3+: "[object HTMLElementConstructor]"
    if (Object.prototype.toString.call((<any>window).HTMLElement).indexOf('Constructor') > 0) this.Browser = "Safari";
    // Chrome 1+
    if (!!(<any>window).chrome && (!!(<any>window).chrome.webstore||!!(<any>window).chrome.runtime)) this.Browser = "Chrome";
    // Edge 20+
    if (!(/*@cc_on!@*/false || !!(<any>document).documentMode) && !!(<any>window).StyleMedia) this.Browser = "Edge";
    // Chromium-based Edge
    if (window.navigator.userAgent.toLowerCase().indexOf('edg/') > -1) this.Browser = "Chromium Edge";
    // Internet Explorer 6-11
    if (/*@cc_on!@*/false || !!(<any>document).documentMode) this.Browser = "IE";
  }

  uploadFile(event) {
    const temp = (event.target as HTMLInputElement).files[0];
    this.file = temp;
  }

  removeFile(){
    this.newTicketForm.controls['attachment'].setValue(null);
    this.file = null;
  }

  private cancelHelp() {
    this.newTicketForm.reset();
    this.removeFile();
  }

  private message(msg: string, type: string, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      if (timeout == 0) {
        options = {
          disableTimeOut : true,
          timeOut: 0,
          extendedTimeOut: 0,
          tapToDismiss: true
        };
      }
      if(type === 'info') {
        this.messager.info(msg, title, options);
      }else if(type === 'warning') {
        this.messager.warning(msg, title, options);
      } else if(type === 'error') {
        this.messager.error(msg, title, options);
      }
    } catch (e) {
    }
  }
}
