import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmSynthComponent } from './am-synth.component';

describe('AmSynthComponent', () => {
  let component: AmSynthComponent;
  let fixture: ComponentFixture<AmSynthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmSynthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmSynthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
