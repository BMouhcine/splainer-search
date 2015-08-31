'use strict';

/*jslint latedef:false*/

(function() {
  angular.module('o19s.splainer-search')
    .factory('EsSearcherFactory', [
      '$http',
      'EsDocFactory',
      'activeQueries',
      'esSearcherPreprocessorSvc',
      'SearcherFactory',
      EsSearcherFactory
    ]);

  function EsSearcherFactory($http, EsDocFactory, activeQueries, esSearcherPreprocessorSvc, SearcherFactory) {

    var Searcher = function(options) {
      SearcherFactory.call(this, options, esSearcherPreprocessorSvc);
    };

    Searcher.prototype = Object.create(SearcherFactory.prototype);
    Searcher.prototype.constructor = Searcher; // Reset the constructor


    Searcher.prototype.addDocToGroup    = addDocToGroup;
    Searcher.prototype.pager            = pager;
    Searcher.prototype.search           = search;

    function addDocToGroup (groupedBy, group, solrDoc) {
      /*jslint validthis:true*/
      var self = this;

      if (!self.grouped.hasOwnProperty(groupedBy)) {
        self.grouped[groupedBy] = [];
      }

      var found = null;
      angular.forEach(self.grouped[groupedBy], function(groupedDocs) {
        if (groupedDocs.value === group && !found) {
          found = groupedDocs;
        }
      });

      if (!found) {
        found = {docs:[], value:group};
        self.grouped[groupedBy].push(found);
      }

      found.docs.push(solrDoc);
    }

    // return a new searcher that will give you
    // the next page upon search(). To get the subsequent
    // page, call pager on that searcher ad infinidum
    function pager () {
      /*jslint validthis:true*/
      var self      = this;
      var start     = 0;
      var nextArgs  = angular.copy(self.args);

      if (nextArgs.hasOwnProperty('start')) {
        start = parseInt(nextArgs.start) + 10;

        if (start >= self.numFound) {
          return null; // no more results
        }
      } else {
        start = 10;
      }

      var remaining       = self.numFound - start;
      nextArgs.rows       = ['' + Math.min(10, remaining)];
      nextArgs.start      = ['' + start];

      var options = {
        fieldList:  self.fieldList,
        url:        self.url,
        args:       nextArgs,
        queryText:  self.queryText,
      };

      var nextSearcher = new Searcher(options);

      return nextSearcher;
    }

    // search (execute the query) and produce results
    // to the returned future
    function search () {
      /*jslint validthis:true*/
      var self      = this;
      var url       = self.url;
      var payload   = self.queryDsl;
      self.inError  = false;

      var thisSearcher  = self;

      var getExplData = function(doc) {
        if (doc.hasOwnProperty('_explanation')) {
          return doc._explanation;
        }
        else {
          return null;
        }
      };

      var getHlData = function(doc) {
        if (doc.hasOwnProperty('highlight')) {
          return doc.highlight;
        } else {
          return null;
        }
      };

      activeQueries.count++;
      return $http.post(url, payload).success(function(data) {
        activeQueries.count--;
        self.numFound = data.hits.total;

        var parseDoc = function(doc, groupedBy, group) {
          var explDict  = getExplData(doc);
          var hlDict    = getHlData(doc);

          var options = {
            groupedBy:          groupedBy,
            group:              group,
            fieldList:          self.fieldList,
            url:                self.url,
            explDict:           explDict,
            hlDict:             hlDict,
          };

          return new EsDocFactory(doc, options);
        };

        angular.forEach(data.hits.hits, function(hit) {
          var doc = parseDoc(hit);
          thisSearcher.docs.push(doc);
        });
      }).error(function() {
        activeQueries.count--;
        thisSearcher.inError = true;
      });
    }

    // Return factory object
    return Searcher;
  }
})();