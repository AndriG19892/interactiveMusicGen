import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FmSynthComponent } from './fm-synth.component';

describe('FmSynthComponent', () => {
  let component: FmSynthComponent;
  let fixture: ComponentFixture<FmSynthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FmSynthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmSynthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
