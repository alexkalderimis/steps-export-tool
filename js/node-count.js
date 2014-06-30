define(function (require, exports, module) {
  'use strict';

  var React = require('react');
  var mixins = require('mixins');
  var Q = require('q');

  var ReadableNumber = require('number');

  var d = React.DOM;

  module.exports = React.createClass({
    displayName: 'NodeCount',

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      var that = this;
      var query = props.query;
      console.log(props.nodes.map(String));

      Q.all(props.nodes.map(getCount.bind(null, query)))
       .then(function (counts) { that.setState({count: sum(counts)}); })
       .then(null, console.error.bind(console));
    },

    getInitialState: function () {
      return {count: 0};
    },

    render: function () {
      var itemCount = this.state.count;
      return d.div(
              {className: 'col-sm-6'},
              d.h1({},
                ReadableNumber({number: itemCount, separator: ',', group: 3}),
                ' ',
                this.props.what,
                (itemCount === 1 ? '' : 's')));
    }
    
  });

  var cache = {};

  function getCount (query, path) {
    var cacheKey = query.service.root + query.toXML() + String(path);
    var ret;
    if (ret = cache[cacheKey]) {
      return ret;
    } else {
      return cache[cacheKey] = query.summarise(path + '.id', 1)
                                    .then(uniquevals);
    }
  }

  function uniquevals (data) { return data.stats.uniqueValues; } 

  function sum (xs) { return xs.reduce(function (a, b) { return a + b; }, 0); }
});
