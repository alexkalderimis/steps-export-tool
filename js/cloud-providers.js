define([], function () {

  var cloudProviders = [
    {
      name: 'Galaxy',
      tool: 'data_source',
      icon: 'icon icon-galaxy',
      url: 'http://localhost:8181',
      description: 'A widely deployed system for genomics analysis tools.'
    },
    {
      name: 'Genomespace',
      gsurl: "https://gsui.genomespace.org/jsui/upload/loadUrlToGenomespace.html",
      icon: 'icon icon-genomespace',
      description: 'A platform for cloud-based bioinformatics, supported by the Broad Institue'
    },
    {
      name: 'Google Drive',
      icon: 'icon icon-google-drive',
      description: 'An online file storage service.'
    },
    {
      name: 'Dropbox',
      icon: 'fa fa-dropbox',
      description: 'An online file storage service'
    }
  ];

  return cloudProviders;
});
