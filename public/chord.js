// This is the root module for the Kibana Chord plugin.
define(function(require) {

  // Load the controller, which renders the visualization.
  require("./chordController");

  // Register the plugin with Kibana.
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
        },
        {
          group: 'buckets',
          name: 'split',
          title: 'Split Diagram',
          min: 0,
          max: 1,
          aggFilter: ['terms', 'filters']
        }
      ])
    });
  }

  require("ui/registry/vis_types").register(ChordProvider);

  return ChordProvider;

});
