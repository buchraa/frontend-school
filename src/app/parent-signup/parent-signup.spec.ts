import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentSignup } from './parent-signup';

describe('ParentSignup', () => {
  let component: ParentSignup;
  let fixture: ComponentFixture<ParentSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
