define(function(require, exports, module) {

  'use strict';

  var React = require('react');
  var Q = require('q');

  var events = require('events');
  var mixins = require('mixins');
  var Path = require('path');
  var NodeCount = require('node-count');
  var Gff3Preview = require('gff3-preview');

  var d = React.DOM;
  var syncro = 0;

  // TODO: move to own file.
  var labelCols = 'col-sm-4';
  var controlCols = 'col-sm-8';

  module.exports = React.createClass({
    displayName: 'Gff3Options',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {exportableNodes: []};
    },

    queryIsNew: function (query) {
      var thisQuery = query.toXML();
      var isDifferent = thisQuery !== this.state.currentQuery;
      this.setState({currentQuery: thisQuery});
      return isDifferent;
    },

    computeState: function (props) {
      if (!this.queryIsNew(props.query)) return;
      var that = this;
      var query = props.query;

      var columns = query.getViewNodes().map(Column).filter(isaSeqFeat);
        
      setTimeout(function () {
        that.setState({exportableNodes: columns});
        var toExport = columns.filter(to('selected')).map(to('path'));
        that.props.onChangeFormatOption('export', toExport);
      });

      function Column (p, i) {
          return {path: p, index: i, selected: true};
      }

      function isaSeqFeat (c) {
        return c.path.isa('SequenceFeature');
      }
    },

    renderExportableNode: function (node) {
      var that = this;
      var button = d.button(
        {
          key: String(node.path),
          onClick: clickHandler,
          className: 'btn btn-default' + (node.selected ? ' active' : '')
        },
        Path(node)
      );
      return button;

      function clickHandler (evt) {
        node.selected = !node.selected;
        that.setState(that.state);
        that.props.onChangeFormatOption(
          'export',
          that.state.exportableNodes.filter(to('selected')).map(to('path'))
        );
      }
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
              what: Path({mine: this.props.mine, path: 'SequenceFeature'})
            })),
          preview);
    },

    renderPreview: function () {
      return Gff3Preview({
        mine: this.props.mine,
        query: this.props.query,
        nodes: (this.props.formatOptions.export || [])
      });
    }
  });

  function to (y) {
    return function (x) {
      return x && x[y];
    }
  }

});

