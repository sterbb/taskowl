import { TestBed } from '@angular/core/testing';

import { MainpageService } from './main.service';

describe('MainService', () => {
  let service: MainpageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainpageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
