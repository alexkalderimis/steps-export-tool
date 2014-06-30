var chan = Channel.build({
  window: window.document.getElementById('child').contentWindow,
  origin: '*',
  scope: 'CurrentStep'
});

var query = {
  name: 'Genes and Proteins',
  select: [
    'symbol', 'primaryIdentifier',
    'exons.symbol',
    'proteins.primaryIdentifier', 'proteins.molecularWeight'],
  from: 'Gene',
  where: [
    ['organism.taxonId', '=', 7227],
    ['chromosome.primaryIdentifier', '=', 'X'],
    ['Gene', 'IN', 'PL FlyTF_putativeTFs']
  ]
};

chan.call({
  method: 'configure',
  params: {
  },
  success: function () {
    console.log("Tool configured");
  },
  error: function (e) {
    console.log("configuration failed because: " + e);
  }
});

chan.call({
  method: 'init',
  params: {
    data: {
      query: query
    },
    service: {
      root: "http://www.flymine.org/query"
    }
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

chan.bind('has-list', function (trans, data) {
  console.log("Woot - list exists");
});

chan.bind('wants', function (trans, params) {
  console.log('WANT', params.what, params.data);
});

