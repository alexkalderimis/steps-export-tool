define(function (require, exports, module) {

  'use strict';

  var React = require('react');
  var events = require('events');
  var GridCount = require('grid-count');

  var d = React.DOM;

  var btn = 'btn btn-default';
  var labelCols = 'col-sm-3';
  var controlCols = 'col-sm-9';

  module.exports = {

    getInitialState: function () {
      return {
        currentQuery: null,
        columnIsDisabled: {},
        firstFewRows: [],
        lastRow: []
      };
    },

    componentWillMount: function () {
      this.computeState(this.props);
    },

    componentWillReceiveProps: function (props) {
      this.computeState(props);
    },

    queryIsNew: function (query) {
      var thisQuery = JSON.stringify(query);
      var isDifferent = thisQuery !== this.state.currentQuery;
      this.setState({currentQuery: thisQuery});
      return isDifferent;
    },

    computeState: function (props) {
      var that = this;

      if (!this.queryIsNew(props.query)) return;

      if (this.getPreview) {
        this.getPreview(props);
      }
      props.mine.count(props.query).then(this.setCount);

    },

    setCount: function (c) {
      this.setState({rowCount: c});
      if (this.onSetCount) {
        this.onSetCount(c);
      }
    },

    countRows: function () {
      var query = this.getEffectiveQuery();
      return count(this.props.mine, query);
    },

    getEffectiveQuery: function () {
      var was = this.props.query.select;
      var is = was.filter(onlySelectedColumns(this.state.columnIsDisabled));
      // TODO: must use actual queries. this is pointless with just objects.

      return _.extend({}, this.props.query, {select: is});
    },

    onColumnSelected: function (index, value) {
      var state = this.state;
      state.columnIsDisabled[index] = value;
      this.setState(state);
    },

    moveColumn: function (oldIdx, newIdx) {
      var query = this.props.query;
      var view = query.select.slice();
      var movendum = view[oldIdx];
      view.splice(oldIdx, 1);
      view.splice(newIdx, 0, movendum);
      this.props.onChangeView(view);
    },
    
    labelCols: labelCols,

    controlCols: controlCols,

    render: function () {
      var s = this.state;

      var preview = this.renderPreview();

      var colCount = this.props.query.select.filter(onlySelectedColumns(s.columnIsDisabled)).length;

      var customControls = [];
      if (this.customControls) {
        customControls = this.customControls();
      }

      return d.form(
          {className: 'form-horizontal', onSubmit: events.preventDefault},
          d.div({className: 'row'},
            d.div({className: 'col-sm-7'}, customControls),
            d.div(
              {className: 'col-sm-5'}, GridCount({cols: colCount, counting: this.countRows()}))),
            d.div({className: 'form-group'}, preview));
    }

  };

  function onlySelectedColumns (deselections) {
    return function (_, i) { return !deselections[i]; };
  }

  var countCache = {};
  function count (mine, query) {
    var k = mine.root + JSON.stringify(query);
    return countCache[k] || (countCache[k] = mine.count(query));
  }

});
