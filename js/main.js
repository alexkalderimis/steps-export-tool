define(function (require, exports, module) {
  'use strict';

  var React = require('react')
    , _ = require('underscore')
    , SpreadSheetOptions = require('spreadsheet-options')
    , Gff3Options = require('gff3-options')
    , DownloadButton = require('download-button')
    , cloudProviders = require('cloud-providers')
    , formats = require('formats');
  require('async!https://apis.google.com/js/client.js?!onload');

  var d = React.DOM;
  
  var tabs = [
    {name: 'Spreadsheet'},
    {name: 'GFF3'},
    {name: 'FASTA'},
    {name: 'XML'},
    {name: 'JSON'}
  ];

  module.exports = React.createClass({
    displayName: 'Main',

    getInitialState: function () {
      return {
        activeTab: 0,
        exportURI: '',
        format: formats[0],
        columns: this.props.query.select.slice(),
        action: 'Download'
      };
    },

    getFileName: function () {
      var name = this.props.query.name || 'results';
      return name + "." + this.state.format.ext;
    },

    render: function () {
      var that = this;
      return d.div(
        {className: 'tabs'},
        d.ul({className: 'nav nav-tabs'}, tabs.map(this.renderTabHeader)),
        d.div({className: 'tab-content'},
          this.renderActiveTab(),
          d.div({
            className: 'cloud-options' + (this.state.cloud ? ' open' : '')
          }, this.renderCloudOptions()),
          d.div({}, // Wrap to prevent matching .tab-content > .active
            DownloadButton({
              mine: this.props.mine,
              query: this.getQuery(),
              fileName: this.getFileName(),
              format: this.state.format.key
            }),
         ' ',
          d.button(
            {
              onClick: function () {
                if (that.state.cloud) {
                  that.setState({cloud: false});
                } else {
                  that.setState({cloud: cloudProviders[0]});
                }
              },
              className: 'btn btn-lg btn-default'
                            + (this.state.cloud ? ' active' : '')},
            d.i({className: 'fa fa-cloud-upload'}),
            ' send to a cloud service'))));
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

    renderCloudOptions: function () {
      var state = this.state
        , that = this;
      return d.div(
          {className: 'row'}, 
          d.div(
            {className: 'col-sm-3'},
            d.ul(
              {className: 'nav nav-tabs nav-stacked cloud-providers'},
              cloudProviders.map(function (provider) {
                return d.li(
                  {
                    key: provider.name,
                    className: state.cloud === provider ? 'active' : ''
                  },
                  d.a({
                    onClick: function () {
                      that.setState({cloud: provider});
                    }
                  },
                  d.i({className: 'fa fa-fw ' + provider.icon}),
                  ' ',
                  provider.name));
              }))),
          d.div(
            {className: 'col-sm-9'},
            this.renderCloudProviderOptions()),
          d.div({className: 'clearfix'}));
    },

    renderCloudProviderOptions: function () {
      var cloud = (this.state.cloud || {});
      var controls = [];
      if (cloud.url) {
        controls.push(d.div(
            {key: 'uri', className: 'form-group'},
            d.label(
              {className: 'col-sm-3 control-label'},
              "URI"),
            d.div(
              {className: 'col-sm-9'},
              d.input({
                type: 'text',
                className: 'form-control',
                value: cloud.url,
                onChange: function (e) {
                }
              }))));
      }
      return d.div(
          {className: 'cloud-provider-options'},
          d.div(
            {className: 'clearfix'},
            d.button(
              {
                onClick: this.sendToCloud,
                className: 'pull-right btn btn-primary'
              },
              d.i({className: 'fa fa-fw ' + cloud.icon}),
              " Send to ", cloud.name),
            d.p({className: 'pull-left'},
              cloud.description,
              d.a({
                href: cloud.uploadedFileUri,
                style: {display: cloud.uploadedFileUri ? 'block' : 'none'}
              }, 'view your file'))),
          d.form(
            {className: 'form-horizontal'},
            d.div(
              {className: 'form-group'},
              d.label(
                {className: 'col-sm-3 control-label'},
                "file name"),
              d.div(
                {className: 'col-sm-9'},
                d.input({
                  type: 'text',
                  className: 'form-control',
                  value: this.getFileName(),
                  onChange: function (e) {
                  }}))),
            controls));
    },

    sendToGoogleDrive: function () {
      var that = this;
      console.log(gapi);
      gapi.auth.authorize({
        client_id: this.props.driveClientId,
        scope: 'https://www.googleapis.com/auth/drive.files',
        immediate: false
      }, handleDriveAuthorisation);

      function handleDriveAuthorisation (auth) {
        if (auth && !auth.error) {
          var boundary = '-------314159265358979323846';
          var delimiter = "\r\n--" + boundary + "\r\n";
          var close_delim = "\r\n--" + boundary + "--";
          gapi.client.load('drive', 'v2', function () {
            that.props.mine
                .query(that.props.query)
                .then(function (q) {
                  return q.getExportURI(that.state.format.key);
                })
                .then($.get)
                .then(function (data) {
              var metadata = {
                title: that.getFileName(),
                mimetype: 'text/plain'
              };
              console.log(data);
              var requestBody =
                delimiter +
                "Content-Type: application/json\r\n\r\n" +
                JSON.stringify(metadata) +
                delimiter +
                "Content-Type: text/tab-separated-values\r\n\r\n" +
                data +
                close_delim;
              var request = gapi.client.request({
                path: '/upload/drive/v2/files',
                method: 'POST',
                params: {uploadType: 'multipart'},
                headers: {
                  'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                body: requestBody
              });
              request.execute(function (file, err) {
                if (file && !file.error) {
                  var state = that.state;
                  console.log(file);
                  state.cloud.uploadedFileUri = file.alternateLink;
                  that.setState(state);
                } else {
                  console.error(err);
                }
              });
            });
          });
        } else {
          console.error(auth);
        }
      }
    },

    sendToCloud: function (e) {
      if (this.state.cloud && this.state.cloud === cloudProviders[2]) {
        this.sendToGoogleDrive();
      }
      e.preventDefault();
    },

    changeMyView: function (columns) {
      this.setState({columns: columns.slice()});
    },

    onChangeFormat: function (format) {
      this.setState({format: format});
    },

    renderActiveTab: function () {
      var that = this;
      var options = {
        format: this.state.format,
        onChangeFormat: this.onChangeFormat,
        mine: this.props.mine,
        query: this.getQuery(),
        onChangeView: this.changeMyView
      };
      switch (this.state.activeTab) {
        case 0:
          return SpreadSheetOptions(options);
        case 1:
          return Gff3Options(options);
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
});
