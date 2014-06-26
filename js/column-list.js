define(function (require, exports, module) {
  'use strict';

  var React = require('react');
  var Path = require('path');
  var Draggable = require('draggable');

  var d = React.DOM;

  module.exports = React.createClass({

    displayName: 'ColumnList',

    getInitialState: function () {
      return {destination: null}
    },

    render: function () {
      return d.ul(
            {className: 'column-list list-group ' + this.controlCols},
            this.props.columns.map(this.renderColumn))
    },

    renderColumn: function (column, i) {
      var that = this;
      var destination = this.state.destination;
      var destClass = '';
      if (destination) {
        if (destination[0] === i && destination[1] === i) {
          destClass = 'list-group-item-info';
        } else if (destination[0] < i && destination[1] === i) {
          destClass = 'dest-after';
        } else if (destination[0] > i && destination[1] === i) {
          destClass = 'dest-before';
        }
      }

      return d.li(
          {
            ref: 'col' + i,
            className: 'list-group-item ' + destClass,
            key: column.key,
          },
          Draggable({
            style: {display: 'block'},
            draggableBy: {x: false, y: true},
            onDragMove: this.highLightDestination.bind(this, i),
            onDragEnd: this.reorderColumns.bind(this, i) 
          },
          d.i({className: 'fa fa-bars pull-right'}),
          d.input({
            type: 'checkbox',
            checked: !column.disabled,
            onChange: this.onColumnChange.bind(this, i)
          }),
          ' ',
          Path({path: column.path})));
    },

    onColumnChange: function (i) {
      this.props.onChangeSelected(i, !this.props.columns[i].disabled);
    },

    highLightDestination: function (colIndex, pos) {
      var newIndex = this.findNewIndex(colIndex, pos);
      this.setState({destination: [colIndex, newIndex]});
    },

    reorderColumns: function (colIndex, pos) {
      var newIndex = this.findNewIndex(colIndex, pos);
      this.setState({destination: null});
      if (newIndex !== colIndex) {
        this.props.moveColumn(colIndex, newIndex);
      }
    },

    findNewIndex: function (colIndex, pos) {
      var newIndex = colIndex
        , columns = this.props.columns
        , that  = this
        , y = pos.top + pos.height / 2;
      // find the lowest column we are above.
      columns.forEach(function (col, i) {
        if (i > colIndex || newIndex !== colIndex) return;
        var midPoint = getMidpoint(i);
        if (y < midPoint) {
          newIndex = i;
        }
      });
      if (newIndex < colIndex) {
        return newIndex;
      }
      // Find the highest column we are to the right of.
      columns.forEach(function (col, i) {
        if (i < colIndex) return;
        var midPoint = getMidpoint(i);
        if (y > midPoint) {
          newIndex = i;
        }
      });

      return newIndex;

      function getMidpoint (i) {
        var node = that.refs['col' + i].getDOMNode();
        var rect = node.getBoundingClientRect();
        var midPoint = rect.top + rect.height / 2;
        return midPoint;
      }
    }
  });
});
