define(function(require) {
  var module = require("ui/modules").get("kibana-chord");

  module.controller("ChordController", function($scope) {
    $scope.greeting = "Hello";
  });

  function ChordProvider(Private) {
    var TemplateVisType = Private(require("ui/template_vis_type/TemplateVisType"));

    return new TemplateVisType({
      name: "chord",
      title: "Chord Diagram",
      icon: "fa-pie-chart", // TODO make this look like a chord diagram
      description: "Visualize network flows with a Chord Diagram.",
      requiresSearch: false,
      template: require("plugins/kibana-chord/chord.html"),
      params: {
        editor: require("plugins/kibana-chord/chord-editor.html")
        defaults: {
          textContent: "Kibana!"
        }
      }
    });
  }

  require("ui/registry/vis_types").register(ChordProvider);

  return ChordProvider;

});
