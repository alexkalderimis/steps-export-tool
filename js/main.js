define(['react'], function (React) {
  'use strict';

  var d = React.DOM;

  var main = React.createClass({
    displayName: 'Main',

    render: function () {
      return d.div(
        {},
        d.h1({}, "Hello ", this.props.place, "!"),
        d.p({}, "This is a friendly greeting"),
        d.button({className: 'btn btn-default btn-lg', onClick: this.props.returnGreeting}, "hi there!"));
    }
  });
  return main;
});
