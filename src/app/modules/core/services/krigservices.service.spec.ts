import { TestBed } from '@angular/core/testing';

import { KrigservicesService } from './krigservices.service';

describe('KrigservicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KrigservicesService = TestBed.get(KrigservicesService);
    expect(service).toBeTruthy();
  });
});
