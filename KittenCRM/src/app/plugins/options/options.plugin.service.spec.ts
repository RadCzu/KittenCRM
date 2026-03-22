import { TestBed } from '@angular/core/testing';

import { OptionsPluginService } from './options.plugin.service';

describe('OptionsPluginService', () => {
  let service: OptionsPluginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptionsPluginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
