import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSchoolYear } from './admin-school-year';

describe('AdminSchoolYear', () => {
  let component: AdminSchoolYear;
  let fixture: ComponentFixture<AdminSchoolYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSchoolYear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSchoolYear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
