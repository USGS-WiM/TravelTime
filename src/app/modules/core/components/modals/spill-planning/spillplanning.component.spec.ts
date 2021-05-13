import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpillPlanningComponent } from './spillplanning.component';

describe('JobsonsComponent', () => {
  let component: SpillPlanningComponent;
  let fixture: ComponentFixture<SpillPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpillPlanningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpillPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
