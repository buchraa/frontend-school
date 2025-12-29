import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentAccess } from './parent-access';

describe('ParentAccess', () => {
  let component: ParentAccess;
  let fixture: ComponentFixture<ParentAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentAccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentAccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
