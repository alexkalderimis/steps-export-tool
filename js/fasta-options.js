define(function(require, exports, module) {

  'use strict';

  var React = require('react');
  var Q = require('q');

  var events = require('events');
  var mixins = require('mixins');
  var Path = require('path');
  var NodeCount = require('node-count');
  var FastaPreview = require('fasta-preview');

  var d = React.DOM;
  var syncro = 0;

  // TODO: move to own file.
  var labelCols = 'col-sm-4';
  var controlCols = 'col-sm-8';

  module.exports = React.createClass({
    displayName: 'FastaOptions',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {exportableNodes: []};
    },

    queryIsNew: function (query) {
      var thisQuery = JSON.stringify(query);
      var isDifferent = thisQuery !== this.state.currentQuery;
      this.setState({currentQuery: thisQuery});
      return isDifferent;
    },

    computeState: function (props) {
      if (!this.queryIsNew(props.query)) return;
      var that = this;
      var ticketNo = ++syncro;

      props.mine
           .query(props.query)
           .then(function (query) {
        if (ticketNo !== syncro) return;
        var columns = query.getViewNodes().map(function (p, i) {
          return {path: p, index: i, selected: i === 0};
        });
        that.setState({
          exportableNodes: columns.filter(function (c) { // Diff here.
            return c.path.isa('SequenceFeature') || c.path.isa('Protein');
          })
        });
      }).then(null, console.error.bind(console));
    },

    renderExportableNode: function (node) {
      var that = this;
      return d.button(
          {
            key: node.path.toString(),
            onClick: function () {
              var state = that.state; // Diff here.
              state.exportableNodes.forEach(function (n) {
                n.selected = false;
              });
              node.selected = !node.selected;
              that.setState(state);
            },
            className: 'btn btn-default' + (node.selected ? ' active' : '')
          },
          Path(node));
    },

    render: function () {
      var exportableNodes = this.state.exportableNodes;
      var preview = this.renderPreview();
      return d.form(
          {className: 'form-horizontal', onSubmit: events.preventDefault},
          d.div({className: 'row'},
            d.div({className: 'col-sm-6'},
              d.div(
                {className: 'form-group'},
                d.label({className: labelCols + ' control-label'},
                  'Exported Items'),
                d.div(
                  {className: 'btn-group ' + controlCols},
                  exportableNodes.map(this.renderExportableNode)))),
            NodeCount({
              mine: this.props.mine,
              query: this.props.query,
              nodes: exportableNodes.filter(to('selected')).map(to('path')),
              what: 'Sequence' // Diff here
            })),
          preview);
    },

    renderPreview: function () {
      return FastaPreview({ // Diff here.
        mine: this.props.mine,
        query: this.props.query,
        nodes: this.state.exportableNodes.filter(to('selected')).map(to('path'))
      });
    }
  });

  function to (y) {
    return function (x) {
      return x && x[y];
    }
  }

});

