define(['react'], function (React) {
  'use strict';

  var d = React.DOM;

  var ReadableNumber = React.createClass({
    displayName: 'ReadableNumber',

    render: function () {
      return d.span({}, formatNumber(this.props));
    }
  });

  return ReadableNumber;

  function formatNumber (options) {
    if (options.number == null) return null;
    var digits = String(options.number).split('');
    var group = [];
    var groups = [group];
    var i;
    for (i = digits.length - 1; i >= 0; i--) {
      if (group.length === options.group) {
        group = [];
        groups.push(group);
      }
      group.push(digits[i]);
    }
    return groups.map(function (grp) { return grp.reverse().join(''); })
                 .reverse()
                 .join(options.separator);
  }
});
