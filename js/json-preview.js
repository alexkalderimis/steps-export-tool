define(['react', 'mixins', 'underscore'], function (React, mixins, _) {
  'use strict';

  var d = React.DOM;
  var cache = {}

  var JSONPreview = React.createClass({
    displayName: 'JSONPreview',

    getInitialState: function () {
      return {endview: [], preview: {results: []}};
    },

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      var that = this;
      var query = props.query;
      var view = props.view;
      var fmt = props.format.key;
      var json = getJSON.bind(null, query, view);

      json({format: fmt, size: 3}).then(function (res) {
        that.setState({preview: res});
      });

      props.counting.then(function (size) {
        that.setState({rows: size});
        json({format: fmt, size: 3, start: size - 3}).then(function (res) {
          that.setState({endview: res.results});
        });
      });

    },

    render: function () {
      var preview = this.state.preview
        , endview = this.state.endview
        , msg = (this.state.rows - 6) + " rows elided"
        , results = _.extend({}, preview, {results: preview.results.concat([msg]).concat(endview)});

      if (this.props.format.key === 'json') {
        return d.pre({},
            preview.results.map(function (e) { return JSON.stringify(e) }).join(',\n'),
            ',\n/*', msg, '*/\n',
            endview.map(function (e) { return JSON.stringify(e) }).join(',\n'));

      }
      return d.pre({},
          JSON.stringify(results, null, ' '));
    }
    
  });

  return JSONPreview;

  function getJSON (query, view, opts) {
    opts.query = query.clone().select(view).toXML();
    var k = query.service.root + JSON.stringify(opts);
    return cache[k] || (cache[k] = query.service.post('query/results', opts));
  }

});
