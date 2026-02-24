import { TestBed } from '@angular/core/testing';

import { CodeExamples } from './code-examples';

describe('CodeExamples', () => {
  let service: CodeExamples;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeExamples);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
