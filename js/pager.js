define(['react'], function (React) {
  'use strict';

  var ul = React.DOM.ul
    , li = React.DOM.li
    , span = React.DOM.span
    , a  = React.DOM.a;

  var Pager = React.createClass({
    displayName: 'Pager',
    render: function () {
      var props = this.props;
      return ul({className: 'pager'},
        li({className: 'previous' + (props.offset ? '' : ' disabled')}, a({onClick: props.back}, "Back")),
        li(null, span(null,
            "Items " + (props.offset + 1) + " to " + (props.offset + props.size) + " of " + props.length)),
        li({className: 'next' + (props.offset + props.size >= props.length ? ' disabled' : '')}, a({onClick: props.next}, "Next")));
    }
  });

  return Pager;
});