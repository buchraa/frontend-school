import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentEnrollmentWizard } from './parent-enrollment-wizard';

describe('ParentEnrollmentWizard', () => {
  let component: ParentEnrollmentWizard;
  let fixture: ComponentFixture<ParentEnrollmentWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentEnrollmentWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentEnrollmentWizard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
