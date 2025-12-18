import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTeacher } from './admin-teacher';

describe('AdminTeacher', () => {
  let component: AdminTeacher;
  let fixture: ComponentFixture<AdminTeacher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTeacher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTeacher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
