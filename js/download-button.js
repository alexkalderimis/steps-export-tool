define(['react', 'mixins'], function (React, mixins) {
  'use strict';

  var d = React.DOM;

  var DownloadButton = React.createClass({
    displayName: 'DownloadButton',

    getInitialState: function () {
      return {};
    },

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      var that = this;
      props.uriPromise.then(function (uri) {
        that.setState({exportURI: uri});
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
        d.strong({}, this.props.fileName));
    }
  });

  return DownloadButton;
});
