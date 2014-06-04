var chan = Channel.build({
  window: window.document.getElementById('child').contentWindow,
  origin: '*',
  scope: 'CurrentStep'
});

chan.call({
  method: 'init',
  params: {
    place: 'IFrame'
  },
  success: function () {
    console.log("Tool initialised");
  },
  error: function (e) {
    console.log("initialisation failed because: " + e);
  }
});

var head = document.getElementsByTagName("head")[0];
var links = document.getElementsByTagName("link");
var i, l, styles = [];
for (i = 0, l = links.length; i < l; i++) {
  chan.call({
    method: 'style',
    params: { stylesheet: links[i].href },
    success: function () {
      console.log("Applied stylesheet");
    },
    error: function (e) {
      console.log(e);
    }
  });
}

chan.bind('has', function (trans, message) {
  alert(message.what + ': ' + message.data);
});

