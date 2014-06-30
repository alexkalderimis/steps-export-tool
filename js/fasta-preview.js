define(function (require, exports, module) {

  'use strict';

  var React = require('react');
  var Q = require('q');

  var mixins = require('mixins');

  var d = React.DOM;

  module.exports = React.createClass({

    displayName: 'FastaPreview',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {};
    },

    computeState: function (props) {
      var that = this
        , setRecords = function (rs) { that.setState({sample: rs}); }
        , paths = props.nodes.map(addid);

        getFasta(props.query, paths).then(setRecords, console.error.bind(console));
    },

    render: function () {
      return d.pre({}, this.state.sample);
    }

  });

  function addid (x) { return x + '.id'; }

  function parseFasta (str) {
    return str.slice(0, 400) + "...";
  }

  var cache = {};

  // This logic is to work around the fact that paging doesn't work in
  // fasta queries (yet!).
  function getFasta (query, paths) {
    var k = query.service.root + query.toXML() + paths.join(';');
    if (!paths || !paths.length) return Q.when([]);
    var clone = query.clone();
    clone.views = paths;
    return cache[k] || (cache[k] = clone.rows({size: 1}).then(function (rows) {
      var id = rows[0][0];
      clone.addConstraint([paths[0], '=', id]);
      return clone.getFASTA({'export': paths}).then(parseFasta);
    }));
  }
});
