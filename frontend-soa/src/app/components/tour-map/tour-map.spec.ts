import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourMap } from './tour-map';

describe('TourMap', () => {
  let component: TourMap;
  let fixture: ComponentFixture<TourMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
