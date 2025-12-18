import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEnrollmentDetail } from './admin-enrollment-detail';

describe('AdminEnrollmentDetail', () => {
  let component: AdminEnrollmentDetail;
  let fixture: ComponentFixture<AdminEnrollmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEnrollmentDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEnrollmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
