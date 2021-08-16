import { Component} from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportModule } from './components/modals/report/report.module';

@Component({
	selector: 'tot-core',
	templateUrl: './core.component.html',
	providers: [NgbModalConfig, NgbModal],
	styleUrls: ['./core.component.scss']
})



export class CoreComponent {

	public mapSize: string ;

	//show: boolean = true;

	constructor(config: NgbModalConfig, private modalService: NgbModal) {}

	public changeMapSize(size) {
		this.mapSize = size;
		$('body').attr('class', size + '-toast-map');
	}
	// public open() {
	// 	const ModalComponentRef = this.modalService.open(ReportModule)
	// }

}
