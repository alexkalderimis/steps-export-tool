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
    'bootstrap'], function (React, imjs, View, config) {
    'use strict';

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
    console.log('CONFIG', config);

    var mine  = imjs.Service.connect({root: "http://www.flymine.org/query/service"});
    var view  = View({
      driveClientId: config.driveClientId,
      dropboxKey: config.dropboxClientKey,
      query: query,
      mine: mine
    });

    React.renderComponent(view, document.body);

});
