  mv bower_components/ bower_components.outoftheway
  git checkout gh-pages
  git merge master
  git push origin gh-pages
  git checkout master
  mv bower_components.outoftheway bower_components
