import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentLayout } from './parent-layout';

describe('ParentLayout', () => {
  let component: ParentLayout;
  let fixture: ComponentFixture<ParentLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
