define([], function () {
  'use strict';

  var formats = [
    {name: 'tab', key: 'tab', ext: 'tsv'},
    {name: 'comma', key: 'csv', ext: 'csv'},
    {name: 'GFF3', key: 'gff3', ext: 'gff3'},
    {name: 'FASTA', key: 'fasta', ext: 'fa'},
    {name: 'XML', key: 'xml', ext: 'xml'},
    {name: 'Rows', key: 'json', ext: 'json'},
    {name: 'Records', key: 'jsonobjects', ext: 'json'}
    
  ];

  return formats;

});
