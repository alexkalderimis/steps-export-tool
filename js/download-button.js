define(['react', 'mixins'], function (React, mixins) {
  'use strict';

  var d = React.DOM;

  var DownloadButton = React.createClass({
    displayName: 'DownloadButton',

    render: function () {
      return d.a(
        {
          href: this.props.uri,
          className: 'btn btn-lg btn-primary'
        },
        d.i({className: 'fa fa-cloud-download'}),
        ' download ',
        d.strong({}, this.props.fileName));
    }
  });

  return DownloadButton;
});
