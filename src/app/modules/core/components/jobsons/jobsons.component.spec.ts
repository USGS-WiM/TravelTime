import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsonsComponent } from './jobsons.component';

describe('JobsonsComponent', () => {
  let component: JobsonsComponent;
  let fixture: ComponentFixture<JobsonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobsonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
