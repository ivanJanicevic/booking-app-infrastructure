import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeypointEditComponent } from './keypoint-edit.component';

describe('KeypointEditComponent', () => {
  let component: KeypointEditComponent;
  let fixture: ComponentFixture<KeypointEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeypointEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeypointEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
