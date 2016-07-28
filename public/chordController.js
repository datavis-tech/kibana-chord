// This module defines the Angular controller that renders the Chord Diagram.
define(function(require) {

  // Load the module that defines the Chord Diagram using only D3.
  var ChordDiagram = require("./chordDiagram");

  // Access the Kibana plugin Angular module.
  var module = require("ui/modules").get("kibana-chord");

  // Register the controller with the Kibana plugin Angular module.
  module.controller("ChordController", function($scope, Private, $element) {

    // Access the DOM element provided by Angular's dependency injection.
    var div = $element[0];

    // Construct an instance of the Chord Diagram.
    var chordDiagram = ChordDiagram(div);

    // Update the visualization with new data as the query response changes.
    $scope.$watch("esResponse", function(response) {
      chordDiagram(tabify(response));
    });

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
