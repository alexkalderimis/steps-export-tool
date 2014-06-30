define(function (require, exports, module) {

  'use strict';

  var React = require('react');
  var Q = require('q');
  var _ = require('underscore');

  var mixins = require('mixins');

  var d = React.DOM;

  var gff3Headers = [
    'seqid',
    'source',
    'type',
    'start',
    'end',
    'score',
    'strand',
    'phase',
    'attributes'
  ];

  module.exports = React.createClass({

    displayName: 'Gff3Preview',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {rows: []};
    },

    computeState: function (props) {
      var that = this
        , setRows = function (rows) { that.setState({rows: rows}); }
        , paths = props.nodes.map(addid);

      props.mine
           .query(props.query)
           .then(getGff3.bind(null, paths))
           .then(setRows, console.error.bind(console));
    },

    render: function () {
      return d.table(
          {className: 'table preview-table'},
          d.thead({}, d.tr({}, gff3Headers.map(function (h, i) {
            return d.th({key: i}, h)}))),
          d.tbody({},
            this.state.rows.map(function (row, i) {
              var opacity = 1 - (0.25 * i);
              return d.tr(
                {key: i},
                row.map(function (cell, j) {
                  return d.td({style: {opacity: opacity}, key: j}, cell);
                }));
            })));
    }

  });

  function addid (x) { return x + '.id'; }

  // Transform gff3 to string[][]. Only read the first 5 rows, in case
  // the server doesn't support sized requests.
  function parseGff3 (gff3) {
    return gff3.split("\n")
               .slice(0, 5)
               .filter(function (line) {return !/^\s*#/.test(line); })
               .map(function (line) { return line.split("\t"); });
  }

  var gff3Cache = {};

  function getGff3 (paths, query) {
    var c = gff3Cache
      , xml = query.toXML()
      , k = query.service.root + xml + paths.join(';');
    if (!paths || !paths.length) return Q.when([]);
    return c[k] || (c[k] = performGffRequest(query, paths).then(parseGff3));
  }

  /**
   * Actually request GFF3, but only for a subset of the actual items.
   */
  function performGffRequest (query, paths) {
    var clone = query.clone();
    clone.select(paths);
    // The gff3 service does not support paging, so to get a sample
    // for this request we will construct a new query constrained
    // to the ids returned in the first 4 rows of this request.
    return clone.rows({size: 4}).then(function (rows) {
      var substituteQ = {
        select: ['SequenceFeature.id'],
        where:  [
          {path: 'SequenceFeature', op: 'IN', ids: _.flatten(rows)}
        ]
      };
      return query.service.query(substituteQ).then(function (subs) {
        return subs.getGFF3();
      });
    });
  }

});
