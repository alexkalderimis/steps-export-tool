define(function (require, exports, module) {
  var React = require('react');

  var mixins = require('mixins');

  var d = React.DOM;

  module.exports = React.createClass({
    displayName: 'Path',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {displayName: null};
    },

    computeState: function (props) {
      var that = this, promise;
      if (props.path.then) {
        promise = props.path.then(function (path) {
          return path.getDisplayName();
        });
      } else if (props.path.getDisplayName) {
        promise = props.path.getDisplayName();
      } else {
        promise = props.mine.fetchModel().then(function (model) {
          return model.makePath(props.path).getDisplayName();
        });
      }
      promise.then(function (name) {
        that.setState({displayName: name});
      }, console.error.bind(console));
    },

    render: function () {
      var name = this.state.displayName;
      if (name && this.props.noRoot) {
        name = name.replace(/[^>]* >/, '');
      }
      return d.span({}, name);
    }

  });
});
