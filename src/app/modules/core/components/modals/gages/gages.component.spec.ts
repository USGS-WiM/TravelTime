import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GagesComponent as GagesComponent } from './gages.component';

describe('GagesmodalComponent', () => {
  let component: GagesComponent;
  let fixture: ComponentFixture<GagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
