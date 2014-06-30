define([
    'react',
    'formats',
    'table-header',
    'grid-options'
    ], function (React, formats, TableHeader, GridOptions) {

  'use strict';

  var d = React.DOM;

  var btn = 'btn btn-default';
  var labelCols = 'col-sm-4';
  var controlCols = 'col-sm-8';
  var previewSize = 3;

  return React.createClass({

    displayName: 'SpreadSheetOptions',

    mixins: [GridOptions],

    renderPreview: function () {
      var preview = d.table(
          {className: 'table preview-table'},
          d.thead({}, d.tr({}, this.renderTableHeaders())),
          d.tbody({},
            this.getFirstFewRows(),
            this.renderExampleRow(),
            this.renderLastRow()));

      return preview;
    },

    getPreview: function (props) {
      var that = this;

      props.mine.rows(props.query, {size: previewSize}).then(function (rows) {
        var state = that.state;
        state.firstFewRows = rows;
        that.setState(state);
      });
    },

    onSetCount: function (c) {
      var that = this, state = this.state;
      this.props.mine.rows(this.props.query, {size: 1, start: c - 1})
                .then(function (rows) {
        that.setState({lastRow: rows[0]});
      });
    },

    customControls: function () {
      var s = this.state;
      return [
        d.div(
          {className: 'form-group', key: 'sep'},
          d.label({className: this.labelCols + ' control-label'}, 'Separator'),
          d.div(
            {className: 'btn-group ' + this.controlCols},
            formats.slice(0, 2).map(this.renderFormatSelector))),
        d.div(
            {className: 'form-group', key: 'headers'},
            d.label({className: labelCols + ' control-label'}, 'Column Headers'),
            d.div(
              {className: 'btn-group ' + controlCols},
              d.button(
                {
                  onClick: this.toggleColumnHeaders,
                  className: btn + (this.props.formatOptions.columnHeaders ? ' active' : '')
                },
                (this.props.formatOptions.columnHeaders ? 'on' : 'off'))))];
    },

    renderFormatSelector: function (format, i) {
      var p = this.props;
      return d.button(
        {
          key: format.key,
          className: (btn + ((format === p.format) ? ' active' : '')),
          onClick: this.setFormat.bind(this, format)
        },
        format.name);
    },

    setFormat: function (fmt) {
      this.props.onChangeFormat(fmt);
    },

    renderTableHeaders: function () {
      var props = this.props;
      var state = this.state;
      var that = this;
      var lastIndex = props.query.select.length - 1;
      return props.query.select.map(function (view, i) {
        var pathPromise = props.mine.query(props.query).then(function (q) {
          return q.makePath(view);
        });
        return TableHeader({
          ref: 'header' + i,
          onDragEnd: that.reorderHeader.bind(that, i),
          isFirst: i === 0,
          isLast: i === lastIndex,
          changePostion: function (delta) {
            var newIdx = i + delta;
            if (newIdx >= 0 && newIdx < props.query.select.length) {
              that.moveColumn(i, newIdx);
            }
          },
          setDisabled: function (isDisabled) {
            var state = that.state;
            state.columnIsDisabled[i] = isDisabled;
            that.setState(state);
          },
          columnHeaders: that.props.formatOptions.columnHeaders,
          disabled: state.columnIsDisabled[i],
          pathPromise: pathPromise,
          key: view
        });
      });
    },

    reorderHeader: function (colIndex, pos) {
      var newIndex = colIndex
        , query = this.props.query
        , that  = this
        , x = pos.left + pos.width / 2;
      // find the lowest column we are to the left of.
      query.select.forEach(function (col, i) {
        if (i > colIndex || newIndex !== colIndex) return;
        var midPoint = getMidpoint(i);
        if (x < midPoint) {
          newIndex = i;
        }
      });
      if (newIndex < colIndex) {
        return moveTo(newIndex);
      }
      // Find the highest column we are to the right of.
      query.select.forEach(function (col, i) {
        if (i < colIndex) return;
        var midPoint = getMidpoint(i);
        if (x > midPoint) {
          newIndex = i;
        }
      });
      if (colIndex !== newIndex) {
        return moveTo(newIndex);
      }

      function getMidpoint (i) {
        var node = that.refs['header' + i].getDOMNode();
        var rect = node.getBoundingClientRect();
        var midPoint = rect.left + rect.width / 2;
        return midPoint;
      }

      function moveTo (newIndex) {
        that.moveColumn(colIndex, newIndex);
      }

    },

    getFirstFewRows: function () {
      var s = this.state;
      var view = this.props.query.select;
      return s.firstFewRows.map(function (row, i) {
        var opacity = 1 - (0.25 * i);
        return d.tr(
          {key: view[i]},
          row.map(function (cell, j) {
            return d.td(
              {
                key: j,
                className: s.columnIsDisabled[j] ? 'disabled' : ''
              },
              d.span(
                {
                  style: {opacity: opacity},
                  className: s.columnIsDisabled[j] ? 'text-muted' : ''
                },
                cell));
          }));
      });
    },

    renderExampleRow: function () {
      return d.tr(
          {},
          this.props.query.select.map(function (_, i) {
            return d.td({key: i}, d.span({}, '...'));
          }));
    },

    renderLastRow: function () {
      var s = this.state;
      return d.tr(
          {},
          s.lastRow.map(function (cell, j) {
            return d.td({key: j},
              d.span(
                {
                  className: s.columnIsDisabled[j] ? 'text-muted' : ''
                },
                cell));
          }));
    },

    toggleColumnHeaders: function () {
      this.props.onChangeFormatOption('columnHeaders', !this.props.formatOptions.columnHeaders);
    }
  });

});

