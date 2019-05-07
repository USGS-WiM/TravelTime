import { TestBed } from '@angular/core/testing';

import { GetNavigationService } from './get-navigation.service';

describe('GetNavigationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetNavigationService = TestBed.get(GetNavigationService);
    expect(service).toBeTruthy();
  });
});
