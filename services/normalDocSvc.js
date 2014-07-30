'use strict';

// Deals with normalizing documents from solr
// into a canonical representation, ie
// each doc has an id, a title, possibly a thumbnail field
// and possibly a list of sub fields
angular.module('o19s.splainer-search')
  .service('normalDocsSvc', function normalDocsSvc(explainSvc) {

    var assignSingleField = function(queryDoc, solrDoc, solrField, toProperty) {
      if (solrDoc.hasOwnProperty(solrField)) {
        queryDoc[toProperty] = solrDoc[solrField].slice(0, 200);
      }
    };

    var assignFields = function(queryDoc, solrDoc, fieldSpec) {
      assignSingleField(queryDoc, solrDoc, fieldSpec.id, 'id');
      assignSingleField(queryDoc, solrDoc, fieldSpec.title, 'title');
      assignSingleField(queryDoc, solrDoc, fieldSpec.thumb, 'thumb');
      queryDoc.subs = {};
      angular.forEach(fieldSpec.subs, function(subFieldName) {
        if (solrDoc.hasOwnProperty(subFieldName)) {
          queryDoc.subs[subFieldName] = solrDoc[subFieldName];
        }
      });
    };

    // A document within a query
    var NormalDoc = function(fieldSpec, doc) {
      this.solrDoc = doc;
      assignFields(this, doc, fieldSpec);
      var hasThumb = false;
      if (this.hasOwnProperty('thumb')) {
        hasThumb = true;
      }
      this.subsList = [];
      var that = this;
      angular.forEach(this.subs, function(subValue, subField) {
        if (typeof(subValue) === 'string') {
          subValue = subValue.slice(0,200);
        }
        var expanded = {field: subField, value: subValue};
        that.subsList.push(expanded);
      });

      this.hasThumb = function() {
        return hasThumb;
      };
      
      this.url = function() {
        return this.solrDoc.url(fieldSpec.id, this.id);
      };

      var explainJson = this.solrDoc.explain(this.id);
      var simplerExplain = explainSvc.createExplain(explainJson);
      var hotMatches = simplerExplain.vectorize();

      this.explain = function() {
        return simplerExplain;
      };
      
      this.hotMatches = function() {
        return hotMatches;
      };

      var hotOutOf = [];
      this.hotMatchesOutOf = function(maxScore) {
        if (hotOutOf.length === 0) {
          angular.forEach(hotMatches.vecObj, function(value, key) {
            var percentage = ((0.0 + value) / maxScore) * 100.0;
            hotOutOf.push({description: key, value: percentage});
          });
          hotOutOf.sort(function(a,b) {return a.percentage - b.percentage;});
        }
        return hotOutOf;
      };

      this.score = simplerExplain.contribution();
    };

    this.createNormalDoc = function(fieldSpec, doc) {
      return new NormalDoc(fieldSpec, doc);
    };

    // A stub, used to display a result that we expected 
    // to find in Solr, but isn't there
    this.createPlaceholderDoc = function(docId, stubTitle) {
      return {id: docId,
              title: stubTitle};
    };

  
  });
