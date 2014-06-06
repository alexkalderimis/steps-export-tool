define([], function () {

  var cloudProviders = [
    {
      name: 'Galaxy',
      icon: 'icon icon-galaxy',
      url: 'http://usegalaxy.org',
      description: 'A widely deployed system for genomics analysis tools.'
    },
    {
      name: 'Genomespace',
      icon: 'icon icon-genomespace',
      url: 'http://genomespace',
      description: 'A platform for cloud-based bioinformatics, supported by the Broad Institue'
    },
    {
      name: 'Google Drive',
      icon: 'icon icon-google-drive',
      description: 'An online file storage service.'
    }
  ];

  return cloudProviders;
});
