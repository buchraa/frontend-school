import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDasboard } from './teacher-dasboard';

describe('TeacherDasboard', () => {
  let component: TeacherDasboard;
  let fixture: ComponentFixture<TeacherDasboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDasboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherDasboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
