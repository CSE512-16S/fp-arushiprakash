/**
 * Created by Administrator on 5/31/2016.
 */
//
// Making all the paths as Bezier curves with calculated control points
d3.csv(filename, function(data){
    var select = document.getElementById("plot_list1");
    var newdata=[];
    keys= Object.keys(data);
    for (i=0;i<select.options.length;i++){
        newdata.push(data[keys[i]]);
        state.push(0);
    }
    state[0]=1;
    return newdata;
}, function(error, rows) {
    var length=rows[0].length;
    var xrows=[];
    for (i= 0;i<rows.length;i++) {
        var yo=[];
        for (k=0;k<length;k++) {
            if (rows[i][k] !== undefined)
            {yo.push(rows[i][k]);}
        }
        yo.push(i);
        xrows.push(yo);
        populateData(xrows);
    }

});
<!-- <div data-role="main" class="ui-content">
        <div data-role="rangeslider">
            <label for="time-min">Time</label>
            <input type="range" name="time-min" id="time-min" value="1" min="1" max="200" onchange="updateData()">
            <label for="time-max">Time</label>
            <input type="range" name="time-max" id="time-max" value="10" min="1" max="200" onchange="updateData()">
        </div>
</div> -->
for (k=0; k<finaldata.length;k++) {
    svg.append("path")
        .attr("d", finaldata[k][3])
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.2)
        .attr("fill", "none");
}

// Making markers
defs = svg.append("defs");

defs.append("marker")
    .attr({
        "id":"arrow",
        "viewBox":"0 -5 10 10",
        "refX":5,
        "refY":0,
        "markerWidth":4,
        "markerHeight":4,
        "orient":"auto",
        "fill" : "red"
    })
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("class","arrowHead");

// Size and numbers for the x and y axis
//
var zoom = d3.behavior.zoom()
    .scaleExtent([1,30])
    .center([width/2,height/2])
    .on("zoom", zoomed);
function zoomed() {
    svg.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
}

function calcPath(MDSdata) {
    //anchor or control points for the Bezier curve
    var path=[];
    for (i=0;i<MDSdata.length-1;i++)
    {
        var num= (Math.random()-0.5)*40;
        path.push("M"+x(MDSdata[i][0])+","+y(MDSdata[i][1])+" C"+(x(MDSdata[i][0])+num)+","+y(MDSdata[i][1])+" "+x(MDSdata[i+1][0])+","+(y(MDSdata[i+1][1])+num)+" "+x(MDSdata[i+1][0])+","+y(MDSdata[i+1][1]));

    }
    // for final point the path is simply itself
    var i= MDSdata.length-1;
    path.push("M"+x(MDSdata[i][0])+","+y(MDSdata[i][1])+" C"+(x(MDSdata[i][0]))+","+y(MDSdata[i][1])+" "+x(MDSdata[i][0])+","+(y(MDSdata[i][1]))+" "+x(MDSdata[i][0])+","+y(MDSdata[i][1]));
    return path;
}
