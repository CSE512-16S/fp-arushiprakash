
function MDScalculate(data,state) {
    var _data = data;
    // Find range of values to scale
    var ranges = [];
    for (i=0;i<_data[0].length;i++){ // for all columns, even the first time column
        var min = 10000000;
        var max = -1000000;
        for (j=0;j<_data.length;j++) {
            min = Math.min(min,_data[j][i]);
            max = Math.max(max,_data[j][i]);
        }
        ranges.push([min,max,Math.abs(max-min)]);
    }
    // Calculating the distance or similarity matrix for 1 column of data
    var distances = []; // calculating it for the Gyration and Energy
    for (i=0; i< _data.length; i++) {
        var arr = [];
        for (j=0; j< _data.length; j++) {
            var dist = 0;
            for (k=0;k<_data[0].length;k++) {
                if (state[k] == 1) {
                    //Euclidean distance
                    dist = dist + Math.pow(Math.abs(_data[i][k]-ranges[k][0])/ranges[k][2] -Math.abs(_data[j][k]-ranges[k][0])/ranges[k][2],2);
                    // Manhattan distance
                    //dist = dist + Math.abs(Math.abs(_data[i][k]-ranges[k][0])/ranges[k][2] -Math.abs(_data[j][k]-ranges[k][0])/ranges[k][2]);
                }
            }
            // Euclidean distance
            arr.push(Math.sqrt(dist));
            // Manhattan distance
            //arr.push(dist);
        }
        distances.push(arr);
    }

    // Conducting multi dimensional scaling (MDS) for this distance matrix
    // This is the classic or simplest version of MDS. We are attempting to recreate the points
    // in 2 dimensions only
    var dimensions = 2;

    // square distances
    var M = numeric.mul(-0.5, numeric.pow(distances, 2));

    // double centre the rows/columns
    function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
    var rowMeans = mean(M),
        colMeans = mean(numeric.transpose(M)),
        totalMean = mean(rowMeans);

    for (var i = 0; i < M.length; ++i) {
        for (var j = 0; j < M[0].length; ++j) {
            M[i][j] += totalMean - rowMeans[i] - colMeans[j];
        }
    }

    // take the SVD of the double centred matrix, and return the
    // points from it
    var ret = numeric.svd(M),
        eigenValues = numeric.sqrt(ret.S);
    MDS = ret.U.map(function(row) {
        return numeric.mul(row, eigenValues).splice(0, dimensions);
    });

    // Rotating matrix
    var Rz = [[Math.cos(0.25*22/7),Math.sin(0.25*22/7)],[-1*Math.sin(0.25*22/7),Math.cos(0.25*22/7)]];

    MDS = numeric.dot(MDS,Rz);
    return MDS;
}

function plotd3(MDSdata,orig,state) {

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var x = d3.scale.linear() // is a function that takes the value of a variable and returns the position that it
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var fisheye = d3.fisheye.circular()
        .radius(150);
// Color scale for use
    var color = d3.scale.category10();
    var colorline = d3.scale.linear().domain([0,MDSdata.length]).range(["lightblue","red"]);
    line = d3.svg.line();
    dragStart = function() {
        coords = [];
        g.selectAll("path").remove();
        d3.selectAll('circle').style("fill", function (d,i) { return colorline(i);});
    };

    drawPath = function(terminator) {
        g.append("path").attr({
            d: line(coords)
        });
        if (terminator) {
            g.select("#terminator").remove();
            g.append("path").attr({
                id: "terminator",
                d: line([coords[0], coords[coords.length-1]])
            });
        }
    };

    dragMove = function() {

        d3.selectAll('circle').classed("selected", false);
        coords.push(d3.mouse(this));
        d3.selectAll('circle').each(function(d, i) {
            point = [d3.select(this).attr("cx"), d3.select(this).attr("cy")];
            if (pointInPolygon(point, coords)) {
                d3.select(this).classed("selected", true).style("fill","black");
            }
        });
        drawPath();
    };

    dragEnd = function() {
        drawPath(true);
        d3.selectAll('circle').each( function (d,i){
            var color123 =d3.select(this).style("fill").split(',');
            color123[0] = color123[0].split('(')[1].trim();
            color123[1] = color123[1].trim();
            color123[2] = color123[2].split(')')[0].trim();

            if ( color123[0] == "0" && color123[1] == "0" && color123[2] == "0" ){
                d3.select(this).classed("selected",true); }
            else { d3.select(this).classed("selected",false);}
        });
    };

    // from https://github.com/substack/point-in-polygon
    pointInPolygon = function (point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        var xi, xj, i, intersect,
            x = point[0],
            y = point[1],
            inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                xi = vs[i][0],
                yi = vs[i][1],
                xj = vs[j][0],
                yj = vs[j][1],
                intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    drag = d3.behavior.drag()
        .on("dragstart", dragStart)
        .on("drag", dragMove)
        .on("dragend", dragEnd);

// Total size of SVG
    var svg = d3.select("#wrap")
        .append("svg")
        .attr("id","main")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(drag);
    var rect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "white")
        .attr("stroke","black")
        .attr("stroke-width",2)
        .style("pointer-events", "all");

// Define the div for the tooltip
    var tooltip = d3.select("body")
        .append("div")
        .data(orig)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("stroke", "black");
    var coords=[];
    g = svg.append('g');
    var dot = g.selectAll('circle');

    //removing overlap in points
    var count = 400;
    var radius = 1.5;
    var min_dist = 2 * radius;
    while (count >0) {
        for (i = 0; i < MDSdata.length; i++) {
            for (j = 0; j < MDSdata.length; j++) {
                // detect overlap
                var dx = (x(MDSdata[i][0]) - x(MDSdata[j][0]));
                var dy = (y(MDSdata[i][1]) - y(MDSdata[j][1]));
                var dist = numeric.sqrt([dx * dx + dy * dy])[0];
                if (min_dist > dist && dist > 0) {
                    // for all overlaps
                    // generate a random angle where the point may be moved
                    var angle = numeric.random([1,1])*3.14*2;
                    MDSdata[j][0] = x.invert(x(MDSdata[i][0]) + 2*radius*numeric.cos([angle])[0]);
                    MDSdata[j][1] = y.invert(y(MDSdata[i][1]) + 2*radius*numeric.sin([angle])[0]);

                }
            }
            count = count - 1;
        }
    }
    range = getRange(MDSdata);
    var scale = height/Math.max(x(range[1])-x(range[0]),y(range[3])-y(range[2]));
    MDSdata = numeric.mul(MDSdata,scale);
    range = getRange(MDSdata);
    x.domain([range[0]-0.1*Math.abs(range[1]-range[0]),range[1]+0.1*Math.abs(range[1]-range[0])]);
    y.domain([range[2]-0.1*Math.abs(range[3]-range[2]),range[3]+0.1*Math.abs(range[3]-range[2])]);


// Making an array that has the new and old points
    var finaldata = [];
    for (i=0;i<MDSdata.length;i++) {
        finaldata.push([MDSdata[i][0],MDSdata[i][1],orig[i]]);
    };
// Put data in circles

        dot.data(finaldata)
        .enter().append("circle")
            .datum( function (d) {
                return { x: x(d[0]), y:y(d[1]), info:d[2]}
            })
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
            .style("fill", function (d,i) { return colorline(i);})
        .style("opacity", 1)
        .on("mouseover", function (d,i) {
            var circleUnderMouse = this;
            d3.selectAll("circle")
                .transition().delay(1000).duration(20)
                .style("opacity", function () { return (this === circleUnderMouse) ? "1":"0.5";});
            d3.select(this)
                .transition().delay(1000).duration(20)
                .attr("stroke","black").attr("stroke-width",2);


            tooltip.style("color", "white").style("background-color", "lightsteelblue").style("padding","2px")
                .html(function () {
                    var text="";
                    var select = document.getElementById("plot_list1");
                    for (j=1;j<select.options.length;j++) {
                        text += select.options[j].textContent + " = " + String(d.info[j-1]) +"</br>";
                    }
                    return text;
                });
            tooltip.transition().delay(1000).duration(20).style("visibility","visible");

        })
        .on("mousemove", function () {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            d3.selectAll("circle").transition().duration(1).style("opacity","1");
            d3.select(this).transition().duration(1).attr("stroke-width",0);
            tooltip.transition().duration(1).style("visibility", "hidden");
        })
        .on("click",function (d,i) {
            document.getElementById("container").removeChild(renderer.domElement);
            if (show3D) {
                length = d.info.length;
                framenum = d.info[length - 1];
                reinit();
                animate();
            }
        });

    svg.on("mousemove", function (){
        fisheye.focus(d3.mouse(this));
        d3.selectAll('circle').each( function(d) { d.fisheye = fisheye(d);})
        d3.selectAll('circle')
        .attr("cx", function(d) { return d.fisheye.x; })
        .attr("cy", function(d) { return d.fisheye.y ; })
            .attr("r", function(d) { return d.fisheye.z *4.5; });
    });
    d3.select("#clear").on("click", function() {
        d3.selectAll('circle').classed("selected", false);
        dragStart();
    });
    d3.select("#writedata").on("click", function() {
        var text="";
        var leng =$("#plot_list1").children('option').length;
        var myOpts = document.getElementById('plot_list1').options
        for (i=1;i<leng;i++) {
            text+= ',' + String(myOpts[i].textContent);
        }
        text+= '<br>';
        d3.selectAll('circle').each( function (d,i){
            if ( d3.select(this).classed("selected")) {
                for (i = 0; i < leng - 1; i++) {
                    text += ',' + String(d.info[i]);
                }
                text += '<br>';
            }
        });
        var myWindow = window.open("", "MsgWindow");
        myWindow.document.write(text);
    })
    d3.select("#writeframe").on("click", function() {

        var fr_nums=[];
        d3.selectAll('circle').each( function (d,i){
            if ( d3.select(this).classed("selected")) {
                fr_nums.push(i);
            }});
        var scope = this;
        var loader = new THREE.XHRLoader( scope.manager );
        loader.load( trajectory, function ( text ) { // XHRloader converted some file into text
        var count=0;
            var frame=0;
        var lines = text.split( "\n" );
            var newtext="";
            for (i=0;i<lines.length;i++){
                count+=1;
                if (fr_nums.indexOf(frame) != -1) {
                    newtext+= String(lines[i])+'\n';
                }
                if (count == atomcount+3) {
                    count = 0;
                    frame+=1;
                }
            }
            writetopage(newtext);
        } );
        function writetopage(text) {
            var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "test.gro");
        }

    })
}
function updatePlotd3(MDSdata,orig,state) {
    d3.select("svg").remove();
    plotd3(MDSdata,orig,state);

}
function getRange(MDSdata) {
    var xmin = +1000000;
    var xmax = -10000000;
    var ymin = +1000000;
    var ymax = -1000000;
    for (i = 0; i < MDSdata.length; i++) {
        xmin = Math.min(MDSdata[i][0], xmin);
        ymin = Math.min(MDSdata[i][1], ymin);
        xmax = Math.max(MDSdata[i][0], xmax);
        ymax = Math.max(MDSdata[i][1], ymax);
    }
    return [xmin,xmax,ymin,ymax];
}
function updateData(){
  state=[];
    var select = document.getElementById("plot_list1");
    for (i=0;i<select.options.length;i++){
        state.push(0);
    }
        state[Number(plot_list1.value)]=1;
        state[Number(plot_list2.value)]=1;
        state[Number(plot_list3.value)]=1;
    loadData(filename,state,t0,t1);
}

function loadData(filename,state,t0,t1) {
    d3.csv(filename, function(data){
        var select = document.getElementById("plot_list1");
        var newdata=[];
        keys= Object.keys(data);
        for (i=0;i<select.options.length;i++){
            newdata.push(data[keys[i]]);
        }
        return newdata;
    }, function(error, rows) {
        var length=rows[0].length;
        var xrows=[];

        for (i= t0-1;i<t1;i++) {
            var yo=[];

            for (k=0;k<length;k++) {
                if (rows [i][k] !== undefined)
                { yo.push(rows[i][k]); }
            }
            yo.push(i);
            xrows.push(yo);
        }
        updatePlotd3(MDScalculate(xrows,state),xrows,state);
    });}

function init() {
    loader = new THREE.PDBLoader();
    baseSprite = document.createElement( 'img' );
    camera = new THREE.PerspectiveCamera( 100, 1, 1, 5000 );
    camera.position.z = 2500; // zoom distance from molecule

    scene = new THREE.Scene();

    root = new THREE.Object3D();
    scene.add( root ); //root is blank
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( 500, 500 ); //sets size the 3D will occupy like svg size
    document.getElementById( 'container' ).appendChild( renderer.domElement );
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 10; // controls how easily the user can manipulate the molecule
    controls.addEventListener( 'change', render );
    //
    baseSprite.onload = function () {
        loadMolecule( trajectory);
    };
    baseSprite.src = 'lib/ball.png';
}
function reinit() {
    $("#footer").show();
    baseSprite = document.createElement( 'img' );

    scene = new THREE.Scene();

    root = new THREE.Object3D();
    scene.add( root ); //root is blank
    document.getElementById( 'container' ).appendChild( renderer.domElement );
    baseSprite.onload = function () {
        for ( var i = 0; i < objects.length; i ++ ) {

            var object = objects[ i ];
            object.parent.remove( object );

        }
        var object=[];
        geometryAtoms = new THREE.Geometry();
        geometryBonds = new THREE.Geometry();

        geometryAtoms.elements = [];
        for ( i = 0; i < frames['frame0'].length; i ++ ) { //set position for each atom in the system

            var x = frames['frame'+String(framenum)][i].x;
            var y = frames['frame'+String(framenum)][i].y;
            var z = frames['frame'+(String(framenum))][i].z;

            var position = new THREE.Vector3( x, y, z );
            geometryAtoms.vertices.push( position );
            geometryAtoms.elements.push( frames['frame'+String(framenum)][i].name );

        }
// change geometry to geometryAtoms here
        objects = [];
        var offset = geometryAtoms.center();
        geometryBonds.translate( offset.x, offset.y, offset.z );
    console.log(CPK);
            for ( var i = 0; i < geometryAtoms.vertices.length; i ++ ) {
                var position = geometryAtoms.vertices[ i ];
                var colorscale = new THREE.Color();
                var A,B,C;
                if (CPK[geometryAtoms.elements[i][0].toLowerCase()] == undefined) {
                    CPK[geometryAtoms.elements[i][0].toLowerCase()] = [128,128,128];
                    A = 128 / 255;
                    B = 128 / 255;
                    C = 128 / 255;
                }
                else {
                    A = CPK[geometryAtoms.elements[i][0].toLowerCase()][0] / 255;
                    B = CPK[geometryAtoms.elements[i][0].toLowerCase()][1] / 255;
                    C = CPK[geometryAtoms.elements[i][0].toLowerCase()][2] / 255;
                }
                var color = colorscale.setRGB( A,B,C );
                var element = geometryAtoms.elements[ i ];

                var canvas = imageToCanvas( baseSprite );
                var context = canvas.getContext( '2d' );
                colorify( context, canvas.width, canvas.height, color, 1 );
                var dataUrl = canvas.toDataURL();
                colorSpriteMap[ element ] = dataUrl;
                colorSprite = colorSpriteMap[ element ];

                var atom = document.createElement( 'img' );
                atom.src = colorSprite;

                var object = new THREE.CSS3DSprite( atom );
                object.position.copy( position );
                object.position.multiplyScalar( 75 );

                object.matrixAutoUpdate = false;
                object.updateMatrix();

                root.add( object );

                objects.push( object );

            }
        console.log("pt1")
            render();
            $("#footer").hide();
    };

    baseSprite.src = 'lib/ball.png';
}
//
function recolor() {
    var select1 = document.getElementById("element_color").value;
    var select2 = (document.getElementById("color_list").value).split(",");

    if (CPK[select1][0] == select2[0] && CPK[select1][1] == select2[1] && CPK[select1][2] == select2[2]) {
    }
    else {
        CPK[select1][0] = parseInt(select2[0]);
        CPK[select1][1] = parseInt(select2[1]);
        CPK[select1][2] = parseInt(select2[2]);
        document.getElementById("container").removeChild(renderer.domElement);
        reinit();
        animate();
    }
}

function colorify( ctx, width, height, color, a ) {

    var r = color.r;
    var g = color.g;
    var b = color.b;

    var imageData = ctx.getImageData( 0, 0, width, height );
    var data = imageData.data;

    for ( var y = 0; y < height; y ++ ) {

        for ( var x = 0; x < width; x ++ ) {

            var index = ( y * width + x ) * 4;

            data[ index ]     *= r;
            data[ index + 1 ] *= g;
            data[ index + 2 ] *= b;
            data[ index + 3 ] *= a;

        }

    }

    ctx.putImageData( imageData, 0, 0 );

}

function imageToCanvas( image ) {

    var width = 256; // controls size of balls
    var height = 256;

    var canvas = document.createElement( 'canvas' );

    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0, width, height );

    return canvas;

}

//

function loadMolecule( url ) {

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        object.parent.remove( object );

    }

    objects = [];
    loader.load( url, function ( geometry, geometryBonds ) {
        var offset = geometry.center();
        geometryBonds.translate( offset.x, offset.y, offset.z );

        for ( var i = 0; i < geometry.vertices.length; i ++ ) {
            if (atomlist[geometry.elements[i].toLowerCase()] == undefined) {
                atomlist[geometry.elements[i].toLowerCase()] = 1;
                var select = document.getElementById("element_color");
                var el = document.createElement("option");
                el.textContent = geometry.elements[i].toLowerCase();
                el.value = geometry.elements[i].toLowerCase();
                select.appendChild(el);
            }
            var position = geometry.vertices[ i ];
            var colorscale = new THREE.Color();
            var A,B,C;
            if (CPK[geometry.elements[i][0].toLowerCase()] == undefined) {
                CPK[geometry.elements[i][0].toLowerCase()] = [128,128,128];
                A = 128 / 255;
                B = 128 / 255;
                C = 128 / 255;
            }
            else {
                A = CPK[geometry.elements[i][0].toLowerCase()][0] / 255;
                B = CPK[geometry.elements[i][0].toLowerCase()][1] / 255;
                C = CPK[geometry.elements[i][0].toLowerCase()][2] / 255;
            }
            var color = colorscale.setRGB( A,B,C );
            var element = geometry.elements[ i ];


            //if ( ! colorSpriteMap[ element ] ) {
             var canvas = imageToCanvas( baseSprite );
             var context = canvas.getContext( '2d' );
             colorify( context, canvas.width, canvas.height, color, 1 );
             var dataUrl = canvas.toDataURL();
             colorSpriteMap[ element ] = dataUrl;



            colorSprite = colorSpriteMap[ element ];

            var atom = document.createElement( 'img' );
            atom.src = colorSprite;

            var object = new THREE.CSS3DSprite( atom );
            object.position.copy( position );
            object.position.multiplyScalar( 75 );

            object.matrixAutoUpdate = false;
            object.updateMatrix();

            root.add( object );

            objects.push( object );

        }
        render();
        $("#footer").hide();

    } );

}

//

function onWindowResize() {

    camera.aspect = 1;
    camera.updateProjectionMatrix();

    renderer.setSize( 500,500 );

    render();

}

function animate() {

    requestAnimationFrame( animate );
    controls.update();

    render();

}

function render() {

    renderer.render( scene, camera );

}

function showDiv() {
    if (document.getElementById('plotting').checked ) {
        $('#plot_options').show();
    }
    else {
        $('#plot_options').hide();
    }
}
function showfigure() {
    if (document.getElementById('3D').checked ) {
        $("#footer").show();
        show3D = true;
        reinit();
        animate();
        $("#footer").hide();
    }
    else {
        document.getElementById("container").removeChild(renderer.domElement);
        show3D= false;
    }

}
