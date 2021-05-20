import { TestBed } from '@angular/core/testing';

import { SpillPlanningService } from './spillplanning.service';

describe('SpillPlanningService  ', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpillPlanningService = TestBed.get(SpillPlanningService);
    expect(service).toBeTruthy();
  });
});
