import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentEnrollment } from './parent-enrollment';

describe('ParentEnrollment', () => {
  let component: ParentEnrollment;
  let fixture: ComponentFixture<ParentEnrollment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentEnrollment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentEnrollment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
