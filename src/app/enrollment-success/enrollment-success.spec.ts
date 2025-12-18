import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentSuccess } from './enrollment-success';

describe('EnrollmentSuccess', () => {
  let component: EnrollmentSuccess;
  let fixture: ComponentFixture<EnrollmentSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollmentSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
