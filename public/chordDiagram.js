// This module defines a reusable Chord Diagram using D3.
define(function(require) {

  // Load D3 v4 via our custom bundle build output.
  var d3 = require("../d3/d3.min");

  // Constructor function for a Chord Diagram.
  // Accepts a container `div` DOM element.
  return function ChordDiagram(div){

    // Configuration parameters.
    var width = 450,
        height = 450,
        outerPadding = 50,
        arcThickness = 20,
        padAngle = 0.07,
        outerRadius = width / 2 - outerPadding,
        innerRadius = outerRadius - arcThickness,
        labelPadding = 10,
        defaultOpacity = 0.6,
        selectedRibbon = null,
        hoveredChordGroup = null,
        data = null,
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
        g = svg.append("g"),
        backgroundRect = g.append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "none")
          .style("pointer-events", "all"),
        ribbonsG = g.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        chordGroupsG = g.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // D3 layouts, shapes and scales.
    var ribbon = d3.ribbon()
          .radius(innerRadius),
        chord = d3.chord()
          .padAngle(padAngle),
        color = d3.scaleOrdinal(),
        arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);

    // Compute a color scheme from d3.schemeCategory20 such that
    // distinct dark colors come first, then light colors later.
    var darkColors = d3.schemeCategory20.filter(function(d, i){
      return i % 2 - 1;
    });
    var lightColors = d3.schemeCategory20.filter(function(d, i){
      return i % 2;
    });
    color.range(darkColors.concat(lightColors));

    // Clear the selected ribbon when clicking on
    // any area other than on a ribbon.
    backgroundRect.on("mousedown", function (){
      my.selectedRibbon(null);
    });

    // Renders the given data as a chord diagram.
    function my(){
    
      // Use the data passed into the .data() accessor.
      if(data){

        // Pre-process the data and calculate the Chord Diagram layout.
        var matrix = generateMatrix(data),
            chords = chord(matrix);

        // Use alphanumerically sorted source and destination names
        // for the color scale domain for consistent colors across refreshes.
        color.domain(matrix.names.slice().sort());

        // Render the ribbons of the Chord Diagram (the connecting fibers inside the circle).
        var ribbons = ribbonsG
          .selectAll("path")
            .data(chords);
        ribbons = ribbons.enter().append("path").merge(ribbons);
        ribbons
          .attr("d", ribbon)
          .style("fill", function(d) {
            return color(matrix.names[d.source.index]);
          })
          .style("stroke", "black")
          .style("stroke-opacity", 0.2)
          .call(setRibbonOpacity)
          .on("mousedown", function (d){
            my.selectedRibbon({
              sourceIndex: d.source.index,
              targetIndex: d.target.index,
              source: matrix.names[d.source.index],
              destination: matrix.names[d.target.index]
            });
          });
        ribbons.exit().remove();

        // Scaffold the chord groups.
        var chordGroups = chordGroupsG.selectAll("g").data(chords.groups);
        var chordGroupsEnter = chordGroups.enter().append("g");
        chordGroupsEnter.append("text");
        chordGroupsEnter.append("path");
        chordGroups.exit().remove();
        chordGroups = chordGroups.merge(chordGroupsEnter);

        // Compute locals.
        chordGroups
          .select("text")
            .each(function(group) {
              angle.set(this, (group.startAngle + group.endAngle) / 2);
              flip.set(this, angle.get(this) > Math.PI);
            })

        // Add labels
        chordGroups
          .select("text")
            .attr("transform", function() {
              return [
                "rotate(" + (angle.get(this) / Math.PI * 180 - 90) + ")",
                "translate(" + (outerRadius + labelPadding) + ")",
                flip.get(this) ? "rotate(180)" : ""
              ].join("");
            })
            .attr("text-anchor", function() {
              return flip.get(this) ? "end" : "start";
            })
            .attr("alignment-baseline", "central")
            .text(function(group) {
              return matrix.names[group.index];
            })
            .style("cursor", "default")
            .style("font-weight", function(group){
              if(selectedRibbon &&
                (
                  (selectedRibbon.sourceIndex === group.index) ||
                  (selectedRibbon.targetIndex === group.index)
                )
              ){
                return "bold";
              } else {
                return "normal";
              }
            })
            .call(chordGroupHover);

        // Render the chord group arcs.
        chordGroups
          .select("path")
            .attr("d", arc)
            .style("fill", function(group) {
              return color(matrix.names[group.index]);
            })
            .call(chordGroupHover);


        // Sets up hover interaction to highlight a chord group.
        // Used for both the arcs and the text labels.
        function chordGroupHover(selection){
          selection
            .on("mouseover", function (group){
              hoveredChordGroup = group;
              my();
            })
            .on("mouseout", function (){
              hoveredChordGroup = null;
              my();
            });
        }

        // Sets the opacity values for all ribbons.
        function setRibbonOpacity(selection){
          selection
            .transition().duration(500)
            .style("opacity", function (d){

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

    // Gets or sets the selected ribbon object,
    // which can be expected to be null
    // or an object with the following fields:
    //
    //  * sourceIndex - The matrix index of the source chord group.
    //  * targetIndex - The matrix index of the destination chord group.
    //  * source - The source name (data value).
    //  * destination - The destination name (data value).
    my.selectedRibbon = function (_){
      if(typeof _ !== "undefined"){
        selectedRibbon = _;
        onSelectedRibbonChangeCallback();
        my();
      } else {
        return selectedRibbon;
      }
    };

    my.data = function (_){
      data = _;
    }

    return my;
  }
});
