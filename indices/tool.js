// main.js
require.config({
    baseUrl: 'js',
    paths: {
        async: '../bower_components/requirejs-plugins/src/async',
        jquery: '../bower_components/jquery/dist/jquery',
        q: '../bower_components/q/q',
        config: '../config/demo',
        gapi: 'https://apis.google.com/js/client.js',
        dropbox: 'https://www.dropbox.com/static/api/2/dropins',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        react: '../bower_components/react/react-with-addons', 
        jschannel: '../bower_components/jschannel/src/jschannel',
        imjs: '../bower_components/imjs/js/im'
    },
    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        dropbox: {
          exports: 'Dropbox'
        },
        gapi: {
          exports: 'gapi'
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

require([
    'react',
    'imjs',
    'main',
    'config',
    'jschannel',
    'bootstrap'], function (React, imjs, View, config, Channel) {
    'use strict';

    // Connect to the parent window.
    var chan = Channel.build({
      window: window.parent,
      origin: '*',
      scope: 'CurrentStep'
    });

    // respect the parents configuration preferences.
    chan.bind('configure', function (trans, params) {
      var key;
      for (key in params) {
        config[key] = params[key];
      }
      return 'ok';
    });

    // Load the exporter with the given query.
    chan.bind('init', function (trans, params) {

      var view  = View({
        driveClientId: config.driveClientId,
        dropboxKey: config.dropboxClientKey,
        query: params.data.query,
        mine: imjs.Service.connect(params.service)
      });

      React.renderComponent(view, document.body);

      return 'ok';
    });

    // Apply parental styles.
    chan.bind('style', function (trans, params) {

      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement('link');

      link.rel = "stylesheet";
      link.href = params.stylesheet;

      head.appendChild(link);
    });

});
