import { Component} from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportModule } from './components/report/report.module';

@Component({
	selector: 'tot-core',
	templateUrl: './core.component.html',
	providers: [NgbModalConfig, NgbModal],
	styleUrls: ['./core.component.scss'],
})

export class CoreComponent {

	//show: boolean = true;

	constructor(config: NgbModalConfig, private modalService: NgbModal) {}

	// public open() {
	// 	const ModalComponentRef = this.modalService.open(ReportModule)
	// }

	public changeMapSize(size) {
		console.log("CHANGING MAP SIZE")
		if(size == "small"){
			$("#mapWrapper").attr('class','small-map');
		}else if(size == "half"){
			$("#mapWrapper").attr('class','half-map');
		}else if(size == "full"){
			$("#mapWrapper").attr('class','full-map');
		}else{
			$("#mapWrapper").attr('class','half-map');
		}
	}
}
