// This module defines the Angular controller that renders the Chord Diagram.
define(function(require) {

  // Load D3 v4 via our custom bundle build output.
  var d3 = require("../d3/d3.min");

  // Register the controller with the Kibana plugin Angular module.
  var module = require("ui/modules").get("kibana-chord");
  module.controller("ChordController", function($scope, Private, $element) {

    // Configuration parameters.
    var width = 500,
        height = 500,
        innerRadius = width / 2 - 50;

    // These "column" variables represent keys in the row objects of the input table.
    var chordWeightColumn = "1",
        chordSourceColumn = "2",
        chordDestinationColumn = "3";

    // Kibana's `tabify` happens to give us column names "1", "2", and "3".
    // These correspond to the Schemas defined for the plugin.
    var weight = function (d){ return d[chordWeightColumn]; },
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
          .radius(innerRadius),
        chord = d3.chord(),
        color = d3.scaleOrdinal()
          .range(d3.schemeCategory20);

    // Update the visualization with new data as the query response changes.
    $scope.$watch("esResponse", function(response) {
      render(tabify(response));
    });

    // Renders the given data as a chord diagram.
    function render(data){

      // Pre-process the data and calculate the Chord Diagram layout.
      var matrix = generateMatrix(data),
          chords = chord(matrix);

      // Render the ribbons of the Chord Diagram (the connecting fibers inside the circle).
      var ribbons = ribbonsG.selectAll("path").data(chords)
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

    // Converts hierarchical result set from ElasticSearch into a tabular form.
    // Returns an array of row objects, similar to the format returned by d3.csv.
    function tabify(response){
      var tabifyAggResponse = Private(require("ui/agg_response/tabify/tabify"));
      var tabified = tabifyAggResponse($scope.vis, response, { asAggConfigResults: true });

      return tabified.tables[0].rows.map(function (array){
        var row = {};
        array.forEach(function (entry){
          row[entry.aggConfig.id] = entry.value;
        });
        return row;
      });
    }

  });
});
