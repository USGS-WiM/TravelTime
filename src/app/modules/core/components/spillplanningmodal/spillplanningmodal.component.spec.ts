import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningModalComponent } from './spillplanningmodal.component';

describe('JobsonsComponent', () => {
  let component: PlanningModalComponent;
  let fixture: ComponentFixture<PlanningModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
