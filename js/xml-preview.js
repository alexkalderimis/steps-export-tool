define(['react', 'mixins'], function (React, mixins) {
  'use strict';

  var d = React.DOM;
  var cache = {}

  var XMLPreview = React.createClass({
    displayName: 'XMLPreview',

    getInitialState: function () {
      return {};
    },

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      var that = this;
      var query = props.query;
      var view = props.view;

      getXML(query, view, {size: 3}).then(function (res) {
        that.setState({preview: res});
      });

      props.counting.then(function (size) {
        that.setState({rows: size});
        getXML(query, view, {size: 3, start: size - 3}).then(function (res) {
          that.setState({endview: res});
        });
      });

    },

    render: function () {
      var preview = this.state.preview
        , endview = this.state.endview;
      if (preview) {
        preview = preview.replace(/<\/ResultSet>/, '');
      }
      if (endview) {
        endview = endview.replace(/[^]*<ResultSet\s*>/, '');
      } else {
        endview = "</ResultSet>";
      }
      return d.pre({}, preview, '<!-- ', this.state.rows - 6, ' rows elided -->', endview);
    }
    
  });

  return XMLPreview;

  function getXML (query, view, opts) {
    opts.query = query.clone().select(view).toXML();
    opts.format = 'xml';
    var k = query.service.root + JSON.stringify(opts);
    return cache[k] || (cache[k] = query.service.post('query/results', opts));
  }

});
