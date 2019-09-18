import { Injectable } from '@angular/core';
import { StudyArea } from '../models/studyarea';
 
@Injectable()
export class StudyAreaService {
    public selectedStudyArea: StudyArea;
}
