// This module defines the Angular controller that renders the Chord Diagram.
define(function(require) {

  // Load D3 v4 via our custom bundle build output.
  var d3 = require("../d3/d3.min");

  // Load the module that defines the Chord Diagram using D3.
  var ChordDiagram = require("./chordDiagram");

  // Load the module that defines the HTML Table using D3.
  var Table = require("./table");

  // Access the Kibana plugin Angular module.
  var module = require("ui/modules").get("kibana-chord");


  // Create a time formatter for the timestamp in the table.
  var formatTime = d3.timeFormat("%B %d, %Y %X");


  // Register the controller with the Kibana plugin Angular module.
  module.controller("ChordController", function($scope, $rootScope, Private, $element, $http) {

    // Access the DOM element provided by Angular's dependency injection.
    var div = $element[0];

    // Construct a Bootstrap Grid to position the Chord Diagram and Table.
    var container = d3.select(div)
            .style("width", "100%")
          .append("div")
            .attr("class", "container-fluid")
          .append("div")
            .attr("class", "row"),
        chordContainer = container
          .append("div")
            .attr("class", "col-md-6")
            .node(),
        tableContainer = container
          .append("div")
            .attr("class", "col-md-6")
            .node();


    // Construct an instance of the Chord Diagram.
    var chordDiagram = ChordDiagram(chordContainer);

    // Construct an instance of the HTML Table.
    var table = Table(tableContainer);

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

    // Update the visualization with new data as the query response changes.
    $scope.$watch("esResponse", function(response) {

      // Tabify the response.
      var data = tabify(response);

      // Render the Chord Diagram.
      chordDiagram(data);

      // Render the HTML Table.
      table(data, [
        { title: "Chord Weight", property: "1" },
        { title: "Chord Sources", property: "2" },
        { title: "Chord Destinations", property: "3" }
      ]);

    });

    // Invoke our custom middleware for querying ElasticSearch
    // when the user clicks on the ribbon.
    //
    // The argument `options` has `source` and `destination` properties
    // based on which ribbon was clicked.
    chordDiagram.onRibbonClick(function (options){

      // Add index and time to the options,
      // which will be the HTTP POST payload.
      options.index = $scope.vis.indexPattern.id;
      options.time = $rootScope.timefilter.time;

      $http
        .post("/api/kibana-chord", options)
        .then(function successCallback(response){

          // Transform the response data into a form the table can use.
          var data = response.data.hits.hits.map(function (d){
            d = d._source;

            // Format timestamp as human-readable date.
            d.timestamp = formatTime(new Date(d.timestamp));

            return d;
          });

          // Render the HTML Table.
          table(data, [
            { title: "Source IP", property: "sourceip" },
            { title: "Destination IP", property: "destinationip" },
            { title: "Type", property: "type" },
            { title: "Timestamp", property: "timestamp" },
            { title: "Packets", property: "packets" }
          ]);

        }, function errorCallback(response){
          throw response;
        });
    });
  });
});
