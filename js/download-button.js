define(['react'], function (React) {
  'use strict';

  var d = React.DOM;

  var DownloadButton = React.createClass({
    displayName: 'DownloadButton',

    getInitialState: function () {
      return {};
    },

    componentWillMount: function () {
      this.computeState(this.props);
    },

    componentWillReceiveProps: function (props) {
      this.computeState(props);
    },

    computeState: function (props) {
      var that = this;
      props.mine.query(props.query).then(function (q) {
        that.setState({exportURI: q.getExportURI(props.format)});
      });
    },

    render: function () {
      return d.a(
        {
          href: this.state.exportURI,
          className: 'btn btn-lg btn-primary'
        },
        d.i({className: 'fa fa-cloud-download'}),
        ' download ',
        this.props.fileName);
    }
  });

  return DownloadButton;
});
