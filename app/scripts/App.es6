import Directive from './Directive.es6lib';
import Routing from './Routing.es6lib';
import SeoController from './SeoController.es6lib';
import Utils from './utils/Utils.es6lib';

const seo = new SeoController();

if (seo.enabled) {
  seo.navigate();
}
else {
  const app = angular.module('TunepalApp', ['ngCookies', 'ngRoute', 'LocalForageModule']);
  const routing = new Routing(app);
  const directive = new Directive(app);
}

$(function() {
  FastClick.attach(document.body);

  $(".button-collapse").sideNav();

  // Side Navigation fix
  $('.side-nav li a').on('click', function(e) {
    const windowWidth = $(window).width();
    if (windowWidth <= Utils.view.mediumScreen) {
      $('.button-collapse').sideNav('hide');
    }
  });

  $('.drag-target').remove();
});
