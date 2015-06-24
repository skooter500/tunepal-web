import Routing from './Routing.es6lib';

$(function() {
  FastClick.attach(document.body);

  $(".button-collapse").sideNav();

  // Side Navigation fix
  $('.side-nav li a').on('click', function(e) {
    let windowSize = $(window).width();
    if (windowSize <= 992) {
      $('.button-collapse').sideNav('hide');
    }
  });

  $('.drag-target').remove();
});

let app = angular.module('TunepalApp', ['ngCookies', 'ngRoute']);

let routing = new Routing(app);
