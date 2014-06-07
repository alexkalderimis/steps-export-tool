define([], function () {
  'use strict';

  // Drive client ids are bound to defined origins. Make sure you use the right
  // client for the right origin.
  var driveClients = {};
  driveClients[-1160247359] =
    "325597969559-0h7jf8u9bsnb96q2uji5ee1r74vrngsu.apps.googleusercontent.com";

  var origin = 0;
  if (typeof window !== 'undefined') {
    origin = hashString(window.location.origin);
  }

  return {
    driveClientId: driveClients[origin]
  };

  // Simple one way hash function so we don't have to expose
  // the origins in source control.
  function buildHash (hash, char) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    return hash & hash;
  }
  function hashString (s) {
    return s.split('').reduce(buildHash, 0);
  }
});

