import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourExecution } from './tour-execution';

describe('TourExecution', () => {
  let component: TourExecution;
  let fixture: ComponentFixture<TourExecution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourExecution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourExecution);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
