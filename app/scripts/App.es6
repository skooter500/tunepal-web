import Routing from './Routing.es6lib'

$(function() {
  FastClick.attach(document.body);
  $(".button-collapse").sideNav();
});

let app = angular.module('TunepalApp', ['ngCookies', 'ngRoute']);

let routing = new Routing(app);
