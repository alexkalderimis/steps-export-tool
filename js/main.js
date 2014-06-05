define([
    'react',
    'underscore',
    'spreadsheet-options'
    ], function (React, _, SpreadSheetOptions) {
  'use strict';

  var d = React.DOM;
  
  var tabs = [
    {name: 'Spreadsheet'},
    {name: 'GFF3'},
    {name: 'FASTA'},
    {name: 'XML'},
    {name: 'JSON'}
  ];

  var main = React.createClass({
    displayName: 'Main',

    getInitialState: function () {
      return {
        activeTab: 0,
        extension: 'tsv',
        columns: this.props.query.select.slice(),
        action: 'Download'
      };
    },

    getFileName: function () {
      return "results." + this.state.extension;
    },

    render: function () {
      return d.div(
        {className: 'tabs'},
        d.ul({className: 'nav nav-tabs'}, tabs.map(this.renderTabHeader)),
        d.div({className: 'tab-content'},
          this.renderActiveTab(),
          d.button(
            {className: 'btn btn-lg btn-primary'},
            d.i({className: 'fa fa-cloud-download'}),
            ' ',
            this.state.action,
            ' ',
            this.getFileName()),
          ' ',
          d.button(
            {className: 'btn btn-lg btn-default'},
            d.i({className: 'fa fa-cloud-upload'}),
            ' send to a cloud service')));
    },

    getQuery: function () {
      var query = _.extend({}, this.props.query, {select: this.state.columns});
      return query;
    },

    renderTabHeader: function (tab, i) {
      return d.li(
        {key: i, className: (i == this.state.activeTab) ? 'active' : null}, 
        d.a(
          {onClick: this.activateTab.bind(this, i)},
          tab.name));
    },

    changeMyView: function (columns) {
      this.setState({columns: columns.slice()});
    },

    renderActiveTab: function () {
      var that = this;
      switch (this.state.activeTab) {
        case 0:
          return SpreadSheetOptions({
            format: this.state.extension,
            onChangeFormat: function (ext) {
              that.setState({extension: ext});
            },
            mine: this.props.mine,
            query: this.getQuery(),
            onChangeView: this.changeMyView
          });
        default:
          return d.div({className: 'alert alert-danger'},
              "Unknown active tab index: ", this.state.activeTab);
      }
    },

    activateTab: function (i) {
      var state = this.state;
      state.activeTab = i;
      this.setState(state);
    }

  });
  return main;
});
