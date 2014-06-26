define(function (require, exports, module) {
  'use strict';

  var React = require('react')
    , _ = require('underscore')
    , SpreadSheetOptions = require('spreadsheet-options')
    , Gff3Options = require('gff3-options')
    , FastaOptions = require('fasta-options')
    , XMLOptions = require('xml-options')
    , JSONOptions = require('json-options')
    , DownloadButton = require('download-button')
    , cloudProviders = require('cloud-providers')
    , formats = require('formats')
    , Dropbox = require('dropbox');
  require('async!https://apis.google.com/js/client.js?!onload');

  var d = React.DOM;
  
  var tabs = [
    {name: 'Spreadsheet', format: 0},
    {name: 'GFF3', format: 2},
    {name: 'FASTA', format: 3},
    {name: 'XML', format: 4},
    {name: 'JSON', format: 5}
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

    getFileBaseName: function () {
      return this.state.fileName || this.props.query.name || 'results';
    },

    getFileName: function () {
      return this.getFileBaseName() + "." + this.state.format.ext;
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
              uriPromise: this.getExportURI(),
              fileName: this.getFileName()
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

    setFileBaseName: function (evt) {
      this.setState({fileName: this.refs.fileName.getDOMNode().value});
    },

    renderCloudProviderOptions: function () {
      var cloud = (this.state.cloud || {});
      var controls = [];
      var that = this;
      var percentDone = this.state.doneness * 100;
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
                ref: 'cloudUrl',
                className: 'form-control',
                value: (cloud.customUrl || cloud.url),
                onChange: function (e) {
                  cloud.customUrl = that.refs.cloudUrl.getDOMNode().value;
                  that.setState({cloud: cloud});
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
              d.div(
                {className: 'row'},
                d.div(
                  {
                    className: 'progress',
                    style: {display: (this.state.doneness == null ? 'none' : 'block')}
                  },
                  d.div(
                    {
                      className: 'progress-bar',
                      role: 'progressbar',
                      style: {'min-width': '10em', width: percentDone + '%'}
                    },
                    d.span({}, percentDone.toFixed(), '% complete')))),
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
                "File Name"),
              d.div(
                {className: 'col-sm-9'},
                d.div(
                  {className: 'input-group'},
                  d.input({
                    type: 'text',
                    ref: 'fileName',
                    className: 'form-control',
                    value: this.getFileBaseName(),
                    onChange: this.setFileBaseName
                  }),
                  d.span(
                    {className: 'input-group-addon'},
                    '.',
                    this.state.format.ext)))),
            controls));
    },

    onUploadProgress: function (doneness) {
      this.setState({doneness: doneness});
    },

    onUploadComplete: function () {
      this.setState({doneness: null, cloud: null});
    },

    onUploadError: function () {
      this.setState({doneness: null});
    },

    /** @returns Promise<string> **/
    getExportURI: function () {
      var format = this.state.format.key;
      var extraOptions = (this.state[format] || {});
      console.log(format, extraOptions.export);
      return this.props.mine.query(this.props.query).then(function (q) {
        return q.getExportURI(format, extraOptions);
      });
    },

    sendToDropbox: function () {
      var that = this;
      var fileName = this.getFileName();
      Dropbox.appKey = this.props.dropboxKey;
      this.getExportURI().then(function (uri) {
        Dropbox.save({
          files: [ {url: uri, filename: fileName} ],
          success: that.onUploadComplete,
          progress: that.onUploadProgress,
          cancel: that.onUploadError,
          error: that.onUploadError
        });
      }).then(
        this.onUploadProgress.bind(this, 0),
        console.error.bind(console));
    },

    sendToGoogleDrive: function () {
      var that = this;
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
      var cloud = this.state.cloud;
      if (cloud === cloudProviders[2]) {
        this.sendToGoogleDrive();
      } else if (cloud === cloudProviders[3]) {
        this.sendToDropbox();
      }
      e.preventDefault();
    },

    changeMyView: function (columns) {
      this.setState({columns: columns.slice()});
    },

    onChangeFormat: function (format) {
      this.setState({format: format});
    },

    onChangeFormatOption: function (option, value) {
      var state = this.state;
      var format = state.format.key;
      var extraOptions = (state[format] || {});
      extraOptions[option] = value;
      state[format] = extraOptions;
      this.setState(state);
    },

    renderActiveTab: function () {
      var that = this;
      var format = this.state.format;
      var extraOptions = (this.state[format.key] || {});
      var options = {
        formatOptions: extraOptions,
        onChangeFormatOption: this.onChangeFormatOption,
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
        case 2:
          return FastaOptions(options);
        case 3:
          return XMLOptions(options);
        case 4:
          return JSONOptions(options);
        default:
          return d.div({className: 'alert alert-danger'},
              "Unknown active tab index: ", this.state.activeTab);
      }
    },

    activateTab: function (i) {
      var state = this.state;
      state.activeTab = i;
      if (tabs[i].format != null) {
        state.format = formats[tabs[i].format];
      }

      this.setState(state);
    }

  });
});
