'use strict';

describe('Service: explainSvc', function () {

  // load the service's module
  beforeEach(module('o19s.splainer-search'));

  var explainSvc = null;
  beforeEach(inject(function (_explainSvc_) {
    explainSvc = _explainSvc_;
  }));

  /* global mockExplain */
  it('parses mockData1', function() {
    explainSvc.createExplain(mockExplain);
  });
});
