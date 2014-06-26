define(function (require, exports, module) {

  exports.ComputableState = {
    componentWillMount: function () {
      this.computeState(this.props);
    },

    componentWillReceiveProps: function (props) {
      this.computeState(props);
    }
  };

});
