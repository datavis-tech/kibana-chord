// This module defines a reusable Chord Diagram using D3.
define(function(require) {

  // Load D3 v4 via our custom bundle build output.
  var d3 = require("../d3/d3.min");

  // Constructor function for a Chord Diagram.
  // Accepts a container `div` DOM element.
  return function ChordDiagram(div){

    // Configuration parameters.
    var width = 500,
        height = 500,
        outerPadding = 50,
        arcThickness = 20,
        padAngle = 0.07,
        outerRadius = width / 2 - outerPadding,
        innerRadius = outerRadius - arcThickness,
        labelPadding = 10;
        // TODO onRibbonClickCallback = function (){};

    // These "column" variables represent keys in the row objects of the input table.
    // Kibana's `tabify` happens to give us column names "1", "2", and "3".
    // These correspond to the Schemas defined for the plugin.
    var chordWeightColumn = "1",
        chordSourceColumn = "2",
        chordDestinationColumn = "3";

    // Accessor functions for columns.
    var weight = function (d){ return d[chordWeightColumn]; },
        source = function (d){ return d[chordSourceColumn]; },
        destination = function (d){ return d[chordDestinationColumn]; };

    // D3 Local objects for DOM-local storage of label angles and
    // whether or not labels should be flipped upside-down.
    var angle = d3.local(),
        flip = d3.local();

    // DOM Elements.
    var svg = d3.select(div).append("svg")
          .attr("width", width)
          .attr("height", height),
        g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        ribbonsG = g.append("g"),
        chordGroupsG = g.append("g");

    // D3 layouts, shapes and scales.
    var ribbon = d3.ribbon()
          .radius(innerRadius),
        chord = d3.chord()
          .padAngle(padAngle),
        color = d3.scaleOrdinal()
          .range(d3.schemeCategory20),
        arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);

    // Renders the given data as a chord diagram.
    function render(data){

      // Pre-process the data and calculate the Chord Diagram layout.
      var matrix = generateMatrix(data),
          chords = chord(matrix);

      // Render the ribbons of the Chord Diagram (the connecting fibers inside the circle).
      var ribbons = ribbonsG
        .selectAll("path")
          .data(chords);
      ribbons.enter().append("path").merge(ribbons)
        .attr("d", ribbon)
        .style("fill", function(d) { return color(d.source.index); })
        .style("opacity", 0.6)
        .style("stroke", "black")
        .style("stroke-opacity", 0.2)
        .on("mousedown", function (d){
          console.log(d);
          console.log("source: " + matrix.names[d.source.index]);
          console.log("destination: " + matrix.names[d.target.index]);
          // TODO invoke onRibbonClickCallback
          // onRibbonClickCallback(d);
        });
      ribbons.exit().remove();

      // Scaffold the chord groups.
      var chordGroups = chordGroupsG.selectAll("g").data(chords.groups);
      var chordGroupsEnter = chordGroups.enter().append("g");
      chordGroupsEnter.append("text");
      chordGroupsEnter.append("path");
      chordGroups.exit().remove();
      chordGroups = chordGroups.merge(chordGroupsEnter);

      // Add labels
      chordGroups
        .select("text")
          .each(function(d) {
            angle.set(this, (d.startAngle + d.endAngle) / 2);
            flip.set(this, angle.get(this) > Math.PI);
          })
          .attr("transform", function(d) {
            return [
              "rotate(" + (angle.get(this) / Math.PI * 180 - 90) + ")",
              "translate(" + (outerRadius + labelPadding) + ")",
              flip.get(this) ? "rotate(180)" : ""
            ].join("");
          })
          .attr("text-anchor", function(d) {
            return flip.get(this) ? "end" : "start";
          })
          .attr("alignment-baseline", "central")
          .text(function(d) {
            return matrix.names[d.index];
          });

      // Render the chord group arcs.
      chordGroups
        .select("path")
          .attr("d", arc)
          .style("fill", function(group) {
            return color(group.index);
          });

    }

    // Generates a matrix (2D array) from the given data, which is expected to
    // have fields {origin, destination, count}. The matrix data structure is required
    // for use with the D3 Chord layout.
    function generateMatrix(data){
      var indices = {},
          matrix = [],
          names = [],
          n = 0, i, j;

      function recordIndex(name){
        if( !(name in indices) ){
          indices[name] = n++;
          names.push(name);
        }
      }

      data.forEach(function (d){
        recordIndex(source(d));
        recordIndex(destination(d));
      });

      for(i = 0; i < n; i++){
        matrix.push([]);
        for(j = 0; j < n; j++){
          matrix[i].push(0);
        }
      }

      data.forEach(function (d){
        i = indices[source(d)];
        j = indices[destination(d)];
        matrix[i][j] = weight(d);
      });

      matrix.names = names;

      return matrix;
    }

    // TODO expose render.onClick
    // render.onRibbonClick = function (callback){
    //   onRibbonClickCallback = callback;
    // };

    return render;
  }
});
