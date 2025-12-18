import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClassesSubjects } from './admin-classes-subjects';

describe('AdminClassesSubjects', () => {
  let component: AdminClassesSubjects;
  let fixture: ComponentFixture<AdminClassesSubjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminClassesSubjects]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminClassesSubjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
