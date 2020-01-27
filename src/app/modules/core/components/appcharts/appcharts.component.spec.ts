import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppchartsComponent } from './appcharts.component';

describe('AppchartsComponent', () => {
  let component: AppchartsComponent;
  let fixture: ComponentFixture<AppchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppchartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
