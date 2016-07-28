// This module defines a reusable data table component using D3.js.
define(function(require) {

  // Load D3 v4 via our custom bundle build output.
  var d3 = require("../d3/d3.min");

  // Constructor function for a data table.
  // Accepts a container `div` DOM element.
  return function Table(div){

    // DOM Elements.
    var tableRoot = d3.select(div)
          .append("table")
            .attr("class", "table table-bordered"),
        tableHeader = tableRoot
          .append("thead")
          .append("tr"),
        tableBody = tableRoot
          .append("tbody");

    // Renders the HTML table with the given data array.
    // Arguments:
    //
    //  * data - An array of row objects.
    //  * columns - An array of column descriptor objects with properties:
    //    * title - The title of the column to display in the header.
    //    * property - The name of the column property in row objects.
    function render(data, columns){
      
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

    return render;
  }
});

