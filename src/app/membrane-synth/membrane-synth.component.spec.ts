import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembraneSynthComponent } from './membrane-synth.component';

describe('MembraneSynthComponent', () => {
  let component: MembraneSynthComponent;
  let fixture: ComponentFixture<MembraneSynthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembraneSynthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembraneSynthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
