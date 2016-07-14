define(function(require) {
  var module = require("ui/modules").get("kibana-chord");

  module.controller("ChordController", function($scope, Private) {

    $scope.$watch("esResponse", function(response) {
      console.log(response);
    });

    $scope.greeting = "Hello";

  });

  function ChordProvider(Private) {
    var TemplateVisType = Private(require("ui/template_vis_type/TemplateVisType"));

    return new TemplateVisType({
      name: "chord",
      title: "Chord Diagram",
      icon: "fa-pie-chart", // TODO make this look like a chord diagram
      description: "Visualize network flows with a Chord Diagram.",
      requiresSearch: true,
      template: require("plugins/kibana-chord/chord.html"),
      params: {
        editor: require("plugins/kibana-chord/chord-editor.html"),
        defaults: {
          textContent: "Kibana!"
        }
      },
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
