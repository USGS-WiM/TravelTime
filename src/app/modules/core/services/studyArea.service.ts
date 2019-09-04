import { Injectable } from '@angular/core';
import { LatLng } from 'leaflet';

@Injectable()
export class StudyAreaService {
    public methodType: String;
    public spillLocation: LatLng;
    public reaches: [];
    public results: [];
}