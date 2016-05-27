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
		loader.load( url[0], function ( text ) { // XHRloader converted some file into text
			var json = scope.parsePDB( text,url[1] ); // your personal parse function to extract meaningful data
			scope.createModel( json, onLoad );
            
		}, onProgress, onError );

	},

	// Parsing a gro file

	parsePDB: function ( text,framenum ) { // Change this to read .gro files

		var atoms = [];
		var bonds = [];
		var histogram = {}; //JSON object
		var bhash = {};
		var lines = text.split( "\n" );
		var x, y, z, e;
        function capitalize( text ) {

            return text.charAt( 0 ).toUpperCase() + text.substr( 1 ).toLowerCase();

        }
        var count=0;
        var atomcount=0;
        var frame=0;
        for ( var i = 0; i < lines.length; i++ ) { //read all lines of the pdb
            count++;
            if (frame==0 && count==2) {
                atomcount=parseInt(lines[i].trim());
            }
            else if ( frame == framenum-1 && count>2 && count < atomcount+3 ) {
                x = 10*parseFloat( lines[i].substring(23,30).trim() );
                y = 10*parseFloat( lines[i].substring(32,39).trim() );
                z = 10*parseFloat( lines[i].substring(41).trim() );
                e = lines[i].substring(11,16).trim().trim().toLowerCase();
                atoms.push( [ x, y, z, capitalize( e ) ] );

                if ( histogram[ e ] == undefined ) histogram[ e ] = 1; //counts the different types of atoms
                else histogram[ e ] += 1;

            }
            else if ( count> atomcount+2 ) { // remove this part since it won't exist for gro files
            if (frame ==0) {
                x = 10*parseFloat( lines[i].substring(0,11).trim() );
                y = 10*parseFloat( lines[i].substring(13,21).trim() );
                z = 10*parseFloat( lines[i].substring(23).trim() );
                bonds.push([x,y,z])
            }
                count=0;
                frame+=1;
            }
        }
		return { "ok": true, "atoms": atoms, "bonds": bonds, "histogram": histogram };

	},

	createModel: function ( json, callback ) {

		var scope = this,
		geometryAtoms = new THREE.Geometry(),
		geometryBonds = new THREE.Geometry();

		geometryAtoms.elements = [];

		var atoms = json.atoms;
		var bonds = json.bonds;
        console.log(bonds[0]);

		for ( var i = 0; i < atoms.length; i ++ ) { //set position for each atom in the system

			var atom = atoms[ i ];

			var x = atom[ 0 ];
			var y = atom[ 1 ];
			var z = atom[ 2 ];

			var position = new THREE.Vector3( x, y, z );
			geometryAtoms.vertices.push( position );
			geometryAtoms.elements.push( atom[ 3 ] );

		}
        //
        // geometryBonds.vertices.push( [0,0,0] );
        // geometryBonds.vertices.push( [bonds[0][0],0,0] );
        // geometryBonds.vertices.push( [0,bonds[0][1],0] );
        // geometryBonds.vertices.push( [bonds[0][0],bonds[0][1],0] );
        // geometryBonds.vertices.push( [0,0,bonds[0][2]] );
        // geometryBonds.vertices.push( [bonds[0][0],0,bonds[0][2]] );
        // geometryBonds.vertices.push( [0,bonds[0][1],bonds[0][2]] );
        // geometryBonds.vertices.push( [bonds[0][0],bonds[0][1],bonds[0][2]] );

		callback( geometryAtoms, geometryBonds, json );

	}

};
