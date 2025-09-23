function catchError(){
	let error = gl.getError();
	if (error !== gl.NO_ERROR) {
	console.error("WebGL error:", error);
	// You can also map the error code to a string for better readability
	// using WebGLDebugUtils if available, or a custom mapping.
	// next error
	error = gl.getError();
	}
}

// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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
	let mv = MatrixMult(trans, rotation_about_xy);

	return mv;
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
		this.matrixMV = gl.getUniformLocation( this.prog, 'matrixMV' );
		// uniform matrix transformations
		this.matrixMVP = gl.getUniformLocation( this.prog, "matrixMVP" );
		// uniform normal matrix
		this.matrixNormal = gl.getUniformLocation( this.prog, "matrixNormal" );
		// swap normal
		this.swap = gl.getUniformLocation( this.prog, "swap" );
		// show texture normal
		this.show = gl.getUniformLocation( this.prog, "show" );

		// light direction for fragment shader
		this.lightDir = gl.getUniformLocation( this.prog, "lightDir" );

		// shininess for fragment shader
		this.shininess = gl.getUniformLocation( this.prog, "shininess" );

		// ids of vert attributes in vertex shader
		this.vertPos = gl.getAttribLocation( this.prog, "pos" );

		// ids of normal attributes in vertex shader
		this.normal = gl.getAttribLocation( this.prog, "normal" );

		// ids of texc attributes in vertex shader
		this.texCoords = gl.getAttribLocation( this.prog, "texc" );

		// initially our vertex buffer is empty since we have no mesh upload
		this.vertbuffer = gl.createBuffer();

		// initially our normal buffer is empty since we have no mesh upload
		this.normbuffer = gl.createBuffer();

		// initially our texture buffer is empty as well
		this.texbuffer = gl.createBuffer();

		// and finally the texture
		this.tex = gl.createTexture();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		// send vpos data
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// send normals data
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		// send texc data
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.swap, swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		// set mvp uniform
		gl.uniformMatrix4fv(this.matrixMVP, false, matrixMVP );
		// set mv uniform
		gl.uniformMatrix4fv( this.matrixMV, false, matrixMV );
		// set normal matrix uniform
		gl.uniformMatrix3fv( this.matrixNormal, false, matrixNormal );
		// vertex buffer
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertbuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );
		// normal buffer
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normbuffer );
		gl.vertexAttribPointer( this.normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray( this.normal );
		// texture buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.vertexAttribPointer(this.texCoords, 2, gl.FLOAT, false, 0, 0); // 2 components (u, v)
		gl.enableVertexAttribArray( this.texCoords );

		// draw the bad boys
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
		gl.useProgram( this.prog );
		gl.uniform1i( this.show, show );
		console.log("SHOWING TEXTURE");
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram( this.prog );
		gl.uniform3f( this.lightDir, x, y, z );
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram( this.prog );
		gl.uniform1f( this.shininess, shininess );
	}
}


let meshVS = `
	attribute vec3 pos;
	attribute vec3 normal;
	attribute vec2 texc;

	// model view matrix
	uniform mat4 matrixMV;

	// model view perspective matrix
	uniform mat4 matrixMVP;

	// normal transformation
	uniform mat3 matrixNormal;

	// for swapping YZ axes 
	uniform bool swap;

	varying vec2 texCoord;
	varying vec3 viewNormal;
	varying vec3 viewDir;

	
	void main()
	{
		// permutation of y and z axes
		mat4 swap_yz = mat4(
						1,  0, 0, 0,
						0,  0, 1, 0, 
						0, -1, 0, 0, 
						0,  0, 0, 1
						);

		// account for normal transformations
		// normals = inverse of mv transformations

		if (swap){
			gl_Position = matrixMVP * swap_yz * vec4(pos, 1.0);
		}
		else{
			gl_Position = matrixMVP * vec4(pos,1.0);
		}

		// for shading purposes
		texCoord = texc;
		viewNormal = matrixNormal * normal;
		viewDir = mat3(matrixMV) * pos;
	}
`;

let meshFS = `
	precision mediump float;

	uniform sampler2D tex;
	uniform vec3 lightDir;
	uniform float shininess;

	varying vec2 texCoord;
	varying vec3 viewNormal;
	varying vec3 viewDir;

	// whether or not to use texture
	uniform bool show;

	void main(){

		vec4 intensity = vec4(1.0, 1.0, 1.0, 1.0);

		vec4 K_d = vec4(1.0);

		if (show){
			// gl_FragColor = texture2D(tex, texCoord);
			K_d = texture2D(tex, texCoord);
		}
		else{
			// gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);	
			K_d = vec4(1.0, 1.0, 1.0, 1.0);
		}

		// interpolation occurs between vector and fragment shader
		// this necesitates normalizing vectors before using them in dot products for example

		vec3 normalizedViewNormal = normalize(viewNormal);
		vec3 normalizedViewDir = normalize(viewDir);
		float cos_n_w = dot(lightDir, normalizedViewNormal);
		// half_vec = ld + viewDir / |ld + viewDir|
		vec3 half_vec = normalize(lightDir + normalizedViewDir);
		vec4 half_vec_alpha = vec4(half_vec, 1.0);

		float cos_n_h = dot(normalizedViewDir, half_vec);
		// I (K_d cos_n_w + K_s cos_n_h^shininess )
		// K_d = difraction coefficient = white | text color
		// K_s = specular coefficient = white
		vec4 K_s = vec4(1.0, 1.0, 1.0, 1.0);

		// gl_FragColor = intensity * (cos_n_w * K_d + K_s * pow(cos_n_h, shininess) );
		float shininess_value = pow(cos_n_h, shininess);
		gl_FragColor = intensity * (cos_n_w * K_d + K_s * shininess_value);

	}
`