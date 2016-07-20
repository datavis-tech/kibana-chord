define(function(require) {
  var d3 = require("../d3/d3.min");

  var module = require("ui/modules").get("kibana-chord");

  module.controller("ChordController", function($scope, Private, $element) {

    // Configuration parameters.
    var width = 500,
        height = 500,
        radius = width / 2 - 50,

        // These "column names" are keys in the row objects of the input table.
        // Kibana's `tabify` gives us column names "1", "2", and "3".
        chordWeightColumn = "1",
        chordSourceColumn = "2",
        chordDestinationColumn = "3",
        weight = function (d){ return d[chordWeightColumn]; },
        source = function (d){ return d[chordSourceColumn]; },
        destination = function (d){ return d[chordDestinationColumn]; };

    // DOM Elements.
    var div = $element[0];
    var svg = d3.select(div).append("svg")
          .attr("width", width)
          .attr("height", height)
        g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        ribbonsG = g.append("g");

    // D3 layouts, shapes and scales.
    var ribbon = d3.ribbon()
          .radius(radius),
        chord = d3.chord(),
        color = d3.scaleOrdinal()
          .range(d3.schemeCategory20);

    // Renders the given data as a chord diagram.
    function render(data){
      var matrix = generateMatrix(data),
          chords = chord(matrix),
          ribbons = ribbonsG.selectAll("path").data(chords);

      ribbons.enter().append("path").merge(ribbons)
        .attr("d", ribbon)
        .style("fill", function(d) { return color(d.source.index); })
        .style("opacity", 0.6)
        .style("stroke", "black")
        .style("stroke-opacity", 0.2);

      ribbons.exit().remove();
      
    }

    // Generates a matrix (2D array) from the given data, which is expected to
    // have fields {origin, destination, count}. The matrix data structure is required
    // for use with the D3 Chord layout.
    function generateMatrix(data){
      var places = {},
          matrix = [],
          n = 0, i, j;

      function recordPlace(place){
        if( !(place in places) ){
          places[place] = n++;
        }
      }

      data.forEach(function (d){
        recordPlace(source(d));
        recordPlace(destination(d));
      });

      for(i = 0; i < n; i++){
        matrix.push([]);
        for(j = 0; j < n; j++){
          matrix[i].push(0);
        }
      }

      data.forEach(function (d){
        i = places[source(d)];
        j = places[destination(d)];
        matrix[i][j] = weight(d);
      });

      return matrix;
    }

    $scope.$watch("esResponse", function(response) {
      var tabifyAggResponse = Private(require("ui/agg_response/tabify/tabify"));

      var tabified = tabifyAggResponse($scope.vis, response, {
        asAggConfigResults: true
      });

      var table = tabified.tables[0].rows.map(function (array){
        var row = {};
        array.forEach(function (entry){
          row[entry.aggConfig.id] = entry.value;
        });
        return row;
      });

      render(table);
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
