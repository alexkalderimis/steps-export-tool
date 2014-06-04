// main.js
var loc = '../';
require.config({
    baseUrl: 'js',
    paths: {
        jquery: loc + 'bower_components/jquery/dist/jquery',
        q: loc + 'bower_components/q/q',
        underscore: loc + 'bower_components/underscore/underscore',
        bootstrap: loc + 'bower_components/bootstrap/dist/js/bootstrap.min',
        react: loc + 'bower_components/react/react-with-addons', 
        jschannel: loc + 'bower_components/jschannel/src/jschannel',
        imjs:  loc + 'bower_components/imjs/js/im'
    },
    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
          deps: ['jquery'],
          exports: '$'
        },
        jschannel: {
          exports: 'Channel'
        },
        underscore: {
            deps: [
            ],
            exports: '_'
        },
        react: {
            exports: 'React',
        }
    }
});

require(['react', 'imjs', 'main', 'jschannel', 'bootstrap'], function (React, imjs, View, Channel) {
    'use strict';

    var chan = Channel.build({
      window: window.parent,
      origin: '*',
      scope: 'CurrentStep'
    });
    var rootNode = document.body;

    chan.bind('init', function (trans, params) {

      var place = params.place;

      var view = new View({
        place: place,
        returnGreeting: returnGreeting
      });
      React.renderComponent(view, rootNode);
      return 'ok';
    });

    chan.bind('style', function (trans, params) {

      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement('link');

      link.rel = "stylesheet";
      link.href = params.stylesheet;

      head.appendChild(link);

    });

    function returnGreeting() {
      chan.notify({
        method: 'has',
        params: {
          what: 'Greeting',
          data: 'Yo'
        }
      });
    }

});
