import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeypointListComponent } from './keypoint-list.component';

describe('KeypointListComponent', () => {
  let component: KeypointListComponent;
  let fixture: ComponentFixture<KeypointListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeypointListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeypointListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
