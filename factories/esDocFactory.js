'use strict';

/*jslint latedef:false*/

(function() {
  angular.module('o19s.splainer-search')
    .factory('EsDocFactory', [
      'DocFactory',
      EsDocFactory
    ]);

  function EsDocFactory(DocFactory) {
    var Doc = function(doc, options) {
      DocFactory.call(this, doc, options);

      var self = this;
      angular.forEach(self.fields, function(fieldValue, fieldName) {
        if ( fieldValue.length === 1 && typeof(fieldValue) === 'object' ) {
          self[fieldName] = fieldValue[0];
        } else {
          self[fieldName] = fieldValue;
        }
      });
    };

    Doc.prototype = Object.create(DocFactory.prototype);
    Doc.prototype.constructor = Doc; // Reset the constructor

    Doc.prototype.url        = url;
    Doc.prototype.explain    = explain;
    Doc.prototype.snippet    = snippet;
    Doc.prototype.source     = source;
    Doc.prototype.highlight  = highlight;

    function url () {
      return '#';
    }

    function explain () {
      /*jslint validthis:true*/
      var self = this;
      return self.options.explDict;
    }

    function snippet () {
      /*jslint validthis:true*/
      var self = this;
      return null;
    }

    function source () {
      /*jslint validthis:true*/
      var self = this;

      // Usually you would return _source, but since we are specifying the
      // fields to display, ES only returns those specific fields.
      // And we are assigning the fields to the doc itself in this case.
      return angular.copy(self);
    }

    function highlight (docId, fieldName, preText, postText) {
      /*jslint validthis:true*/
      var self = this;
      return self.options.hlDict;
    }

    return Doc;
  }
})();