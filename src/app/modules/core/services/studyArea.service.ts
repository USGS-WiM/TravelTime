import { Injectable } from '@angular/core';
import { StudyArea } from '../models/studyarea';
import { LatLng } from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from './navigationservices.service';
 
@Injectable()
export class StudyAreaService {
    public selectedStudyArea: StudyArea;
    private messager: ToastrService;
    private NavigationService: NavigationService;

    constructor(toastr: ToastrService, navService: NavigationService) {
        this.messager = toastr;
        this.NavigationService = navService;
    }

    public setSelectedStudyArea(point: LatLng){
        this.NavigationService.getNavigationResource("3")
        .toPromise().then(data => {
          this.selectedStudyArea.POI = data['configuration'];
        }); //get service {description: Initial description}
    //this.newFunc(); moving layers control to the sidebar

        
    }
}