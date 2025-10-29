import { TestBed } from '@angular/core/testing';

import { TouristLocation } from './tourist-location';

describe('TouristLocation', () => {
  let service: TouristLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TouristLocation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
