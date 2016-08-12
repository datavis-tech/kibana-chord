// This module defines a reusable data table component using D3.js.
define(function(require) {

  // Load D3 v4 via our custom bundle build output.
  var d3 = require("../d3/d3.min");

  // Configuration.
  var headerBackgroundColor = "lightblue";

  // Constructor function for a data table.
  // Accepts a container `div` DOM element.
  return function Table(div){

    // DOM Elements.
    var tableContainer = d3.select(div),
        tableTitleContainer = tableContainer.append("div")
          .style("font-size", "2em")
          .style("margin-top", "0.5em"),
        tableRoot = tableContainer
          .append("table")
            .attr("class", "table table-bordered"),
        tableHeader = tableRoot
          .append("thead")
            .style("background-color", headerBackgroundColor)
          .append("tr"),
        tableBody = tableRoot
          .append("tbody");

    // Internal variables
    var
    
        // An array of row objects.
        data,
        
        // An array of column descriptor objects with properties:
        //  * title - The title of the column to display in the header.
        //  * property - The name of the column property in row objects.
        columns,
        
        // The human-readable title for the top of the table.
        title;

    // Renders the table.
    function my(){

      // Set the title.
      tableTitleContainer.text(title);

      // Populate the table header.
      var titles = tableHeader.selectAll("th").data(columns);
      titles.exit().remove();
      titles = titles.enter().append("th").merge(titles);
      titles.text(function (d) { return d.title; });

      // Populate the table rows.
      var tr = tableBody.selectAll("tr").data(data);
      tr.exit().remove();
      tr = tr.enter().append("tr").merge(tr);
      
      // Set the values for each table cell using a nested selection.
      var td = tr.selectAll("td").data(function (row) {
        return columns.map(function (column) {
          return row[column.property];
        });
      });
      td.exit().remove();
      td = td.enter().append("td").merge(td);
      td.text( function (d) { return d; });
    }

    my.data = function (_){
      //return _ ? data = _, my : data;
      if(_){
        data = _;
        return my;
      } else {
        return data;
      }
    };

    my.columns = function (_){
      //return _ ? columns = _, my : columns;
      if(_){
        columns = _;
        return my;
      } else {
        return columns;
      }
    };

    my.title = function (_){
      //return _ ? title = _, my : title;
      if(arguments.length){
        title = _;
        return my;
      } else {
        return title;
      }
    };

    return my;
  }
});
