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


	//show: boolean = true;

	constructor(config: NgbModalConfig, private modalService: NgbModal) {}

	// public open() {
	// 	const ModalComponentRef = this.modalService.open(ReportModule)
	// }

}
