import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClassGroupDetail } from './admin-class-group-detail';

describe('AdminClassGroupDetail', () => {
  let component: AdminClassGroupDetail;
  let fixture: ComponentFixture<AdminClassGroupDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminClassGroupDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminClassGroupDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
