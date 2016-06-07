/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.PDBLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.PDBLoader.prototype = {

	constructor: THREE.PDBLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;
		var loader = new THREE.XHRLoader( scope.manager );
		loader.load( url, function ( text ) { // XHRloader converted some file into text
			var json = scope.parsePDB( text ); // your personal parse function to extract meaningful data
			scope.createModel( json, onLoad );
            
		}, onProgress, onError );

	},

	// Parsing a gro file

	parsePDB: function ( text ) { // Change this to read .gro files

		var atoms = [];
		var bonds = [];
		var histogram = {}; //JSON object
		var lines = text.split( "\n" );
		var x, y, z, e;
        function capitalize( text ) {

            return text.charAt( 0 ).toUpperCase() + text.substr( 1 ).toLowerCase();

        }
        var count=0;

        var frame=0;
		var curr_frame=[];
        for ( var i = 0; i < lines.length; i++ ) { //read all lines of the pdb
            count++;
            if (frame==0 && count==2) {
                atomcount=parseInt(lines[i].trim());
            }
            //else if ( frame == framenum-1 && count>2 && count < atomcount+3 ) {
			else if ( count>2 && count < atomcount+3 ) {
                x = 10*parseFloat( lines[i].substring(23,30).trim() );
                y = 10*parseFloat( lines[i].substring(32,39).trim() );
                z = 10*parseFloat( lines[i].substring(41).trim() );
                e = lines[i].substring(11,16).trim().trim().toLowerCase();
				var pos = { 'name':e,'x' : x, 'y':y, 'z':z};
				curr_frame.push(pos);


            }
            else if ( count> atomcount+2 ) { // remove this part since it won't exist for gro files
            if (frame ==0) {
                xbox = 10*parseFloat( lines[i].substring(0,11).trim() );
                ybox = 10*parseFloat( lines[i].substring(13,21).trim() );
                zbox = 10*parseFloat( lines[i].substring(23).trim() );
            }
				frames['frame'+String(frame)]=curr_frame;
				curr_frame=[];
                count=0;
                frame+=1;
            }
        }
		return { "ok": true, "bonds": bonds};

	},

	createModel: function ( json, callback ) {

		var scope = this,
		geometryAtoms = new THREE.Geometry(),
		geometryBonds = new THREE.Geometry();

		geometryAtoms.elements = [];

		//var atoms = json.atoms;
		var bonds = json.bonds;

		for ( var i = 0; i < frames['frame0'].length; i ++ ) { //set position for each atom in the system

			var x = frames['frame'+String(framenum-1)][i].x;
			var y = frames['frame'+String(framenum-1)][i].y;
			var z = frames['frame'+(String(framenum-1))][i].z;

			var position = new THREE.Vector3( x, y, z );
			geometryAtoms.vertices.push( position );
			geometryAtoms.elements.push( frames['frame'+String(framenum-1)][i].name );

		}

		callback( geometryAtoms, geometryBonds, json );

	}

};
