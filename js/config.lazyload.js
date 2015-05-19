// lazyload config

var app = angular.module('myApp');
/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
app.constant('JQ_CONFIG', {
  plot: ['vendors/jquery/charts/flot/jquery.flot.js']
});