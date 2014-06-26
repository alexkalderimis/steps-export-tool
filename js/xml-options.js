define([
    'react',
    'grid-options',
    'xml-preview',
    'column-list'
    ],
    function (React, GridOptions, XMLPreview, ColumnList) {
  'use strict';

  var d = React.DOM;

  var XMLOptions = React.createClass({
    displayName: 'XMLOptions',

    mixins: [GridOptions],

    customControls: function () {
      var props = this.props;
      var state = this.state;
      var that = this;

      var qp = props.mine.query(props.query);
      var columns = props.query.select.map(function (p, i) {
        return {key: p, path: qp.then(function (q) { return q.makePath(p); }), disabled: state.columnIsDisabled[i]};
      });
      return d.div(
          {className: 'form-group', key: 'view'},
          d.label({className: this.labelCols + ' control-label'}, 'Columns'),
          d.div({className: this.controlCols},
            ColumnList({
              moveColumn: this.moveColumn,
              onChangeSelected: this.onColumnSelected,
              columns: columns
            })));
    },

    renderPreview: function () {
      var that = this;
      return XMLPreview({
        mine: this.props.mine,
        query: this.props.query,
        counting: this.countRows(),
        view: this.props.query.select.filter(function (_, i) {
          return !that.state.columnIsDisabled[i];
        })
      });
    }

  });

  return XMLOptions;
});
