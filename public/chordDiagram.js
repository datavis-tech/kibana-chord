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
        labelPadding = 10,
        defaultOpacity = 0.6,
        selectedRibbon = null,
        hoveredChordGroup = null,
        onSelectedRibbonChangeCallback = function (){};

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
    function my(data){

      // Pre-process the data and calculate the Chord Diagram layout.
      var matrix = generateMatrix(data),
          chords = chord(matrix);

      // Render the ribbons of the Chord Diagram (the connecting fibers inside the circle).
      var ribbons = ribbonsG
        .selectAll("path")
          .data(chords);
      ribbons = ribbons.enter().append("path").merge(ribbons);
      ribbons
        .attr("d", ribbon)
        .style("fill", function(d) {
          return color(d.source.index);
        })
        .style("stroke", "black")
        .style("stroke-opacity", 0.2)
        .call(setRibbonOpacity)
        .on("mousedown", function (d){
          selectedRibbon = {
            sourceIndex: d.source.index,
            targetIndex: d.target.index,
            source: matrix.names[d.source.index],
            destination: matrix.names[d.target.index]
          };
          onSelectedRibbonChangeCallback();
          setRibbonOpacity(ribbons);
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
          })
          .style("cursor", "default")
          .call(chordGroupHover);

      // Render the chord group arcs.
      chordGroups
        .select("path")
          .attr("d", arc)
          .style("fill", function(group) {
            return color(group.index);
          })
          .call(chordGroupHover);


      // Sets up hover interaction to highlight a chord group.
      // Used for both the arcs and the text labels.
      function chordGroupHover(selection){
        selection
          .on("mouseover", function (group){
            hoveredChordGroup = group;
            setRibbonOpacity(ribbons);
          })
          .on("mouseout", function (){
            hoveredChordGroup = null;
            setRibbonOpacity(ribbons);
          });
      }

      // Sets the opacity values for all ribbons.
      function setRibbonOpacity(selection){
        selection.style("opacity", function (d){

          // If there is a currently selected ribbon,
          if(selectedRibbon){

            // show the selected chord in full color,
            if(
              (selectedRibbon.sourceIndex === d.source.index) &&
              (selectedRibbon.targetIndex === d.target.index)
            ){
              return defaultOpacity;
            } else {

              // and show all others faded out.
              return 0.1;
            }
          } else {

            // If there is no currently selected ribbon,
            // then if there is a hovered chord group,
            if(hoveredChordGroup){

              // show the ribbons connected to the hovered chord group in full color,
              if(
                (d.source.index === hoveredChordGroup.index) ||
                (d.target.index === hoveredChordGroup.index)
              ){
                return defaultOpacity;
              } else {

                // and show all others faded out.
                return 0.1;
              }
            } else {

              // Otherwise show all ribbons with slight transparency.
              return defaultOpacity;
            }
          }
        });
      }
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

    my.onSelectedRibbonChange = function (callback){
      onSelectedRibbonChangeCallback = callback;
    };

    my.selectedRibbon = function (){
      return selectedRibbon;
    };

    return my;
  }
});
