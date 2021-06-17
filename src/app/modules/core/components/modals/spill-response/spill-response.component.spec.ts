import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpillResponseComponent } from './spill-response.component';

describe('JobsonsComponent', () => {
  let component: SpillResponseComponent;
  let fixture: ComponentFixture<SpillResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpillResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpillResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
