import Routing from './Routing.es6lib';
import SeoController from './SeoController.es6lib';

$(function() {
  FastClick.attach(document.body);

  $(".button-collapse").sideNav();

  // Side Navigation fix
  $('.side-nav li a').on('click', function(e) {
    const windowSize = $(window).width();
    if (windowSize <= 992) {
      $('.button-collapse').sideNav('hide');
    }
  });

  $('.drag-target').remove();
});

const seo = new SeoController();

if (seo.enabled) {
  seo.navigate();
}
else {
  window.tunepalApp = angular.module('TunepalApp', ['ngCookies', 'ngRoute']);
  window.tunepalRouting = new Routing(window.tunepalApp);
}
