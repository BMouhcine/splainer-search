'use strict';

angular.module('o19s.splainer-search')
  .service('esUrlSvc', function esUrlSvc() {

    var self      = this;
    self.protocol = null;
    self.host     = null;
    self.pathname = null;

    self.parseUrl     = parseUrl;
    self.buildDocUrl  = buildDocUrl;
    self.buildUrl     = buildUrl;

    /**
     *
     * private method fixURLProtocol
     * Adds 'http://' to the beginning of the URL if no protocol was specified.
     *
     */
    var protocolRegex = /^https{0,1}\:/;
    function fixURLProtocol(url) {
      if (!protocolRegex.test(url)) {
        url = 'http://' + url;
      }
      return url;
    }

    /**
     *
     * Parses an ES URL of the form [http|https]://[host][:port]/[collectionName]/_search
     * Splits up the different parts of the URL.
     *
     */
    function parseUrl (url) {
      url = fixURLProtocol(url);
      var a = document.createElement('a');
      a.href = url;
      url = a;

      self.protocol = a.protocol;
      self.host     = a.host;
      self.pathname = a.pathname;
    };

    /**
     *
     * Builds ES URL of the form [protocol]://[host][:port]/[index]/[type]/[id]
     * for an ES document.
     *
     */
    function buildDocUrl (doc) {
      var index = doc._index;
      var type  = doc._type;
      var id    = doc._id;

      var url = self.protocol + '//' + self.host;
      url = url + '/' + index + '/' + type + '/' + id;

      return url;
    }

    /**
     *
     * Builds ES URL for a search query.
     * Adds any query params if present: /_search?from=10&size=10
     */
    function buildUrl (url, params) {
      // Return original URL if no params to append.
      if (params === undefined ) {
        return url;
      }

      var paramsAsStrings = [];

      angular.forEach(params, function(value, key) {
        paramsAsStrings.push(key + '=' + value);
      });

      // Return original URL if no params to append.
      if ( paramsAsStrings.length === 0 ) {
        return url;
      }

      var finalUrl = url;

      if (finalUrl.substring(finalUrl.length - 1) === '?') {
        finalUrl += paramsAsStrings.join('&');
      } else {
        finalUrl += '?' + paramsAsStrings.join('&');
      }

      return finalUrl;
    }
  });