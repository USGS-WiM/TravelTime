import { TestBed } from '@angular/core/testing';
import { GetTimeoftravelService } from './get-timeoftravel.service';

describe('GetTimeoftravelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetTimeoftravelService = TestBed.get(GetTimeoftravelService);
    expect(service).toBeTruthy();
  });
});
