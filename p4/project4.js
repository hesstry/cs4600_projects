// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	let rotation_about_x = [
		1,    0,                   0,					0,
		0,    Math.cos(rotationX), Math.sin(rotationX), 0, 
		0, -1*Math.sin(rotationX), Math.cos(rotationX), 0,
		0,    0,                   0,                   1
	];

	let rotation_about_y = [
		Math.cos(rotationY), 0, -1*Math.sin(rotationY), 0,
		0, 				     1,  0, 					0,
		Math.sin(rotationY), 0,  Math.cos(rotationY),   0,
		0,    				 0,  0,                     1
	];

	let rotation_about_xy = MatrixMult(rotation_about_x, rotation_about_y);

	// By rotating first, you ensure rotation about center of object
	let mvp = MatrixMult(trans, rotation_about_xy);
	mvp = MatrixMult( projectionMatrix, mvp );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram( meshVS, meshFS );

		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.swap = gl.getUniformLocation( this.prog, "swap" );
		this.show = gl.getUniformLocation( this.prog, "show" );

		// ids of vert attributes in shaders
		this.vertPos = gl.getAttribLocation( this.prog, "pos" );

		// ids of texc attributes in shaders
		this.texCoords = gl.getAttribLocation( this.prog, "texc" );

		// initially our vertex buffer is empty since we have no mesh upload
		this.vertbuffer = gl.createBuffer();

		// initially our texture buffer is empty as well
		this.texbuffer = gl.createBuffer();

		// and finally the texture
		this.tex = gl.createTexture();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		// sending vpos data
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// sending texc data
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader

		// activate program
		gl.useProgram(this.prog);
		// set the swap value
		gl.uniform1i(this.swap, swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		// activate program
		gl.useProgram(this.prog);
		// set mvp matrix
		gl.uniformMatrix4fv( this.mvp, false, trans );
		// vertex buffer
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertbuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );

		// tex buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.vertexAttribPointer(this.texCoords, 2, gl.FLOAT, false, 0, 0); // 2 components (u, v)
		gl.enableVertexAttribArray( this.texCoords );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{

		// [TO-DO] Bind the texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture( gl.TEXTURE_2D, this.tex );
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		// zoom in and zoom out mipmap filtering
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.LINEAR, // bilinear interpolation between mipmaps for zooming in
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_LINEAR, // trilinear interpolation for zooming out
		)

		// assigning shader tex variable
		let sampler = gl.getUniformLocation(this.prog, 'tex'); // connecting to Texture Unit ON GPU
		gl.useProgram(this.prog);
		gl.uniform1i(sampler, 0); // directly related to active texture that is binded
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		// activate program
		gl.useProgram(this.prog);
		// set the show value
		gl.uniform1i(this.show, show);
	}
	
}

let meshVS = `
	attribute vec3 pos;
	attribute vec2 texc;

	uniform mat4 mvp;

	// for swapping YZ axes 
	uniform bool swap;

	varying vec2 texCoord;
	
	void main()
	{
		// permutation of y and z axes
		mat4 swap_yz = mat4(
						1,  0, 0, 0,
						0,  0, 1, 0, 
						0, -1, 0, 0, 
						0,  0, 0, 1
						);

		if (swap){
			gl_Position = mvp * swap_yz * vec4(pos, 1.0);
		}
		else{
			gl_Position = mvp * vec4(pos,1.0);
		}

		texCoord = texc;
	}
`;

let meshFS = `
	precision mediump float;

	uniform sampler2D tex;
	varying vec2 texCoord;

	// whether or not to use texture
	uniform bool show;

	void main(){
		if (show){
			gl_FragColor = texture2D(tex, texCoord);
		}
		else{
			gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);	
		}
	}
`