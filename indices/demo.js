// main.js
require.config({
    baseUrl: 'js',
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        q: '../bower_components/q/q',
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

require(['react', 'imjs', 'main', 'bootstrap'], function (React, imjs, View) {
    'use strict';

    var query = {
      select: ['taxonId', 'genus', 'species'],
      from: 'Organism'
    };

    var mine  = imjs.Service.connect({root: "http://www.flymine.org/query/service"});
    var view  = View({query: query, mine: mine});

    React.renderComponent(view, document.body);

});
