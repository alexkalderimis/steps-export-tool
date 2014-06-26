define([], function () {
  'use strict';

  return {preventDefault: preventDefault};

  function preventDefault (event) {
    event.preventDefault();
    return null;
  }

});
