import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GagesmodalComponent } from './gagesmodal.component';

describe('GagesmodalComponent', () => {
  let component: GagesmodalComponent;
  let fixture: ComponentFixture<GagesmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GagesmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GagesmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
