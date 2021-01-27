import { TestBed } from '@angular/core/testing';

import { UpstreamtotService } from './upstreamtot.service';

describe('UpstreamtotService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UpstreamtotService = TestBed.get(UpstreamtotService);
    expect(service).toBeTruthy();
  });
});
