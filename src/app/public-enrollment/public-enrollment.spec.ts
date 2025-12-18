import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicEnrollment } from './public-enrollment';

describe('PublicEnrollment', () => {
  let component: PublicEnrollment;
  let fixture: ComponentFixture<PublicEnrollment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicEnrollment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicEnrollment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
