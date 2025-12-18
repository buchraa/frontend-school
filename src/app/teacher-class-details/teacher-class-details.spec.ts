import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherClassDetails } from './teacher-class-details';

describe('TeacherClassDetails', () => {
  let component: TeacherClassDetails;
  let fixture: ComponentFixture<TeacherClassDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherClassDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherClassDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
