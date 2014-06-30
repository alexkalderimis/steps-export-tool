define(['react', 'jquery', 'underscore'], function (React, $, _) {

  'use strict';

  var d = React.DOM;

  var Draggable = React.createClass({

    displayName: 'Draggable',

    getDefaultProps: function () {
      // allow the initial position to be passed in as a prop
      return {
        onDragEnd: function () {},
        onDragMove: null, // Only called once, and null guarded then.
        onDragStart: function () {},
        draggableBy: {x: true, y: true},
        initialPos: {x: 0, y: 0}
      };
    },

    getInitialState: function () {
      return {
        pos: this.props.initialPos,
        dragStart: {x: 0, y: 0},
        dragging: false,
        rel: null // position relative to the cursor
      };
    },

    // we could get away with not having this (and just having the listeners on
    // our div), but then the experience would be possibly be janky. If there's
    // anything w/ a higher z-index that gets in the way, then you're toast,
    componentDidUpdate: function (props, state) {
      if (this.state.dragging && !state.dragging) {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
      } else if (!this.state.dragging && state.dragging) {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
      }
    },

      // calculate relative position to the mouse and set dragging=true
    onMouseDown: function (e) {
      // only left mouse button
      if (e.button !== 0) return;
      var pos = $(this.getDOMNode()).offset();
      this.setState({
        dragging: true,
        dragStart: {
          x: e.pageX,
          y: e.pageY
        }
      });
      this.props.onDragStart();
      e.stopPropagation();
      e.preventDefault();
    },

    onMouseUp: function (e) {
      var state = this.state;
      this.props.onDragEnd(this.getDOMNode().getBoundingClientRect());
      this.setState({dragging: false, pos: {x: 0, y: 0}});
      e.stopPropagation();
      e.preventDefault();
    },

    /**
     * notify listeners of the current position.
     * This method is throttled to avoid calling the blocking
     * method 'getBoundingClientRect' with unnecessary frequency.
     */
    notifyMove: _.throttle(function () {
      if (!this.props.onDragMove) return;
      this.props.onDragMove(this.getDOMNode().getBoundingClientRect());
    }, 100),

    onMouseMove: function (e) {
      if (!this.state.dragging) return;
      var newPos = {};
      if (this.props.draggableBy.x) {
        newPos.x = e.pageX - this.state.dragStart.x;
      }
      if (this.props.draggableBy.y) {
        newPos.y = e.pageY - this.state.dragStart.y;
      }
      this.setState({pos: newPos});
      this.notifyMove();
      e.stopPropagation();
      e.preventDefault();
    },

    render: function () {
      // transferPropsTo will merge style & other props passed into our
      // component to also be on the child DIV.
      return this.transferPropsTo(d.div({
        onMouseDown: this.onMouseDown,
        className: 'draggable' + (this.state.dragging ? ' dragging' : ''),
        style: {
          position: 'relative',
          left: this.state.pos.x + 'px',
          top: this.state.pos.y + 'px'
        }
      }, this.props.children));
    }
  });

  return Draggable;
});
