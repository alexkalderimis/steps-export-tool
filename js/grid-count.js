define(function (require, exports, module) {

  'use strict';

  var React = require('react');
  var mixins = require('mixins');
  var ReadableNumber = require('number');

  var d = React.DOM;

  module.exports = React.createClass({
    displayName: 'GridCount',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {};
    },

    computeState: function (props) {
      var that = this;
      props.counting.then(function (n) {
        that.setState({rows: n});
      });
    },

    render: function () {
      var state = this.state;
      return d.h1({},
                this.props.cols,
                ' column',
                (this.props.cols === 1 ? '' : 's'),
                ' x ',
                ReadableNumber({group: 3, separator: ',', number: state.rows}),
                ' rows');
    }
  });
});
