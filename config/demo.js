define([], function () {
  'use strict';

  // Drive client ids are bound to defined origins. Make sure we use the right
  // client for the right origin.
  var driveClients = {};
  driveClients[3213448] =
    "325597969559-0h7jf8u9bsnb96q2uji5ee1r74vrngsu.apps.googleusercontent.com";

  var dropboxClients = {};
  dropboxClients[3213448] = "gqr6vpcnp8rmhe5";

  var domain, key = 0;
  if (typeof window !== 'undefined') {
    domain = window.location.origin.split(':')[0];
    key = hashString(domain);
  }

  return {
    driveClientId: driveClients[key],
    dropboxClientKey: dropboxClients[key]
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

