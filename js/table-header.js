define(['react', 'draggable'], function (React, Draggable) {
  'use strict';

  var d = React.DOM;

  var TableHeader = React.createClass({
    displayName: 'TableHeader',

    getDefaultProps: function () {
      // allow the initial position to be passed in as a prop
      return {
        changePostion: function () {},
        onDragEnd: function () {}
      };
    },

    getInitialState: function () {
      return {pathName: [], dragging: false};
    },

    render: function () {
      return d.th({},
        d.input({
          type: 'checkbox',
          onChange: this.toggleDisabled,
          checked: !this.props.disabled
        }),
        ' ',
        d.button({
          className: 'btn btn-sm',
          onClick: this.changePostion.bind(this, -1)
        }, d.i({className: 'fa fa-angle-left'})),
        d.span({
          className: 'text-muted',
          style: {
            position: 'absolute',
            display: this.state.dragging ? 'inline-block' : 'none'
          }
        }, this.renderPathName()),
        Draggable(
          {
            style: {display: 'inline-block'},
            onDragStart: this.onDragStart,
            draggableBy: {x: true, y: false},
            onDragEnd: this.onDragEnd
          },
          d.span(
            {
              key: 'pathName',
              className: (this.props.disabled || !this.props.columnHeaders)
                          ? 'text-muted' : null},
            this.renderPathName())
        ),
        d.button({
          className: 'btn btn-sm',
          onClick: this.changePostion.bind(this, +1)
        }, d.i({className: 'fa fa-angle-right'}))
        );
    },

    renderPathName: function () {
      return this.state.pathName;
    },

    changePostion: function (delta) {
      this.props.changePostion(delta);
    },

    onDragStart: function () {
      this.setState({dragging: true});
    },

    onDragEnd: function (pos) {
      this.setState({dragging: false});
      this.props.onDragEnd(pos);
    },

    componentWillMount: function () {
      this.computeState(this.props);
    },

    componentWillReceiveProps: function (props) {
      this.computeState(props);
    },

    computeState: function (props) {
      var that = this;
      props.pathPromise
           .then(function (path) { return path.getDisplayName(); })
           .then(function (name) {
        that.setState({pathName: name});
      });
    },

    toggleDisabled: function () {
      this.props.setDisabled(!this.props.disabled);
    }
  });

  return TableHeader;

});
