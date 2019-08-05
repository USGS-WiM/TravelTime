import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwisSiteComponent } from './nwis-site.component';

describe('NwisSiteComponent', () => {
  let component: NwisSiteComponent;
  let fixture: ComponentFixture<NwisSiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NwisSiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwisSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
