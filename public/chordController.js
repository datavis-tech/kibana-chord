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

    // Metadata for rendering the HTML table.
    var columns = [
      { title: "Chord Weight", property: "1" },
      { title: "Chord Sources", property: "2" },
      { title: "Chord Destinations", property: "3" }
    ];

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
      table(data, columns);
    });

    //TODO invoke middleware on chord click.
    // chordDiagram.onClick(function (d){ $http.post... });

    // Invoke our custom middleware for querying ElasticSearch.
    $http
      .post("/api/kibana-chord", {
        index: $scope.vis.indexPattern.id,
        time: $rootScope.timefilter.time
      })
      .then(function successCallback(response){

        // TODO set the content of the table here.
        // table(tabify(response), columns);

        console.log(JSON.stringify(response.data));
      }, function errorCallback(response){
        throw response;
      });

  });
});
