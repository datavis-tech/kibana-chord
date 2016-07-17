define(function(require) {
  var d3 = require("../d3/d3.min");

  var module = require("ui/modules").get("kibana-chord");

  module.controller("ChordController", function($scope, Private, $element) {
    var div = $element[0];
    d3.select(div).append("h1").text("Hello D3!");

    $scope.$watch("esResponse", function(response) {
      var tabifyAggResponse = Private(require("ui/agg_response/tabify/tabify"));

      var table = tabifyAggResponse($scope.vis, response, {
        asAggConfigResults: true
      });

      $scope.dataDump = JSON.stringify(table, null, 2);
    });
  });

  function ChordProvider(Private) {
    var TemplateVisType = Private(require("ui/template_vis_type/TemplateVisType"));
    var Schemas = Private(require("ui/Vis/Schemas"));

    return new TemplateVisType({
      name: "chord",
      title: "Chord Diagram",
      icon: "fa-pie-chart", // TODO make this look like a chord diagram
      description: "Visualize network flows with a Chord Diagram.",
      requiresSearch: true,
      template: require("plugins/kibana-chord/chord.html"),
      schemas: new Schemas([
        {
          group: "metrics",
          name: "weight",
          title: "Chord Weight",
          min: 1,
          max: 1,
          aggFilter: ["count", "sum"]
        },
        {
          group: "buckets",
          name: "src",
          title: "Chord Sources",
          min: 1,
          max: 1,
          aggFilter: "terms"
        },
        {
          group: "buckets",
          name: "dest",
          title: "Chord Destinations",
          min: 1,
          max: 1,
          aggFilter: "terms"
        }
      ])
    });
  }

  require("ui/registry/vis_types").register(ChordProvider);

  return ChordProvider;

});
