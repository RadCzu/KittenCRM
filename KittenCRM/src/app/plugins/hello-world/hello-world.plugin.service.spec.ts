import { TestBed } from '@angular/core/testing';

import { HelloWorldPluginService } from './hello-world.plugin.service';

describe('OptionsPluginService', () => {
  let service: HelloWorldPluginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelloWorldPluginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
