define([
    'react',
    'formats',
    'grid-options',
    'json-preview',
    'column-list'
    ],
    function (React, formats, GridOptions, JSONPreview, ColumnList) {
  'use strict';

  var d = React.DOM;

  var JSONOptions = React.createClass({
    displayName: 'JSONOptions',

    mixins: [GridOptions],

    customControls: function () {
      var props = this.props;
      var state = this.state;
      var that = this;
      var query = props.query;

      var columns = query.views.map(function (p, i) {
        return {key: p, path: query.makePath(p), disabled: state.columnIsDisabled[i]};
      });
      var columnControls = d.div(
          {className: 'form-group', key: 'view'},
          d.label({className: this.labelCols + ' control-label'}, 'Columns'),
          d.div({className: this.controlCols},
            ColumnList({
              moveColumn: this.moveColumn,
              onChangeSelected: this.onColumnSelected,
              columns: columns
            })));
      var jsonFormats = formats.slice(5);

      var formatControls = d.div(
          {className: 'form-group', key: 'formats'},
          d.label({className: this.labelCols + ' control-label'}, 'Format'),
          d.div({className: this.controlCols},
            d.div({className: 'btn-group'},
              jsonFormats.map(this.renderFormatButton))));

      return [formatControls, columnControls];
    },

    renderFormatButton: function (format, i) {
      var that = this;
      return d.button({
        key: format.key,
        onClick: function () { that.props.onChangeFormat(format) },
        className: 'btn btn-default' + (format === this.props.format ? ' active' : '')
      }, format.name);
    },

    renderPreview: function () {
      var that = this;
      return JSONPreview({
        mine: this.props.mine,
        format: this.props.format,
        query: this.props.query,
        counting: this.countRows(),
        view: this.props.query.views.filter(function (_, i) {
          return !that.state.columnIsDisabled[i];
        })
      });
    }

  });

  return JSONOptions;
});
