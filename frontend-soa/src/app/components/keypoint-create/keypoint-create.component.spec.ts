import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeypointCreateComponent } from './keypoint-create.component';

describe('KeypointCreateComponent', () => {
  let component: KeypointCreateComponent;
  let fixture: ComponentFixture<KeypointCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeypointCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeypointCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
