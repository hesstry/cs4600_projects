// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
	constructor()
	{
		this.prog   = InitShaderProgram( curvesVS, curvesFS );
		// [TO-DO] Other initializations should be done here.
		// ------------------------------------------------

		// ids of uniform vars in vertex shader
		this.mvp = gl.getUniformLocation( this.prog, "mvp" );

		// furthermore get id of attribute location for time steps
		this.times = gl.getAttribLocation( this.prog, 't' );

		// get uniform vars for positions of control points
		this.p0 = gl.getUniformLocation( this.prog, "p0" );
		this.p1 = gl.getUniformLocation( this.prog, "p1" );
		this.p2 = gl.getUniformLocation( this.prog, "p2" );
		this.p3 = gl.getUniformLocation( this.prog, "p3" );
		
		// Initialize the attribute buffer
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		// [TO-DO] This is where you can create and set the contents of the vertex buffer object
		// for the vertex attribute we need.

		// create buffer
		this.buffer = gl.createBuffer();

		// bind and populate it with time steps
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);
	}
	setViewport( width, height )
	{
		// [TO-DO] This is where we should set the transformation matrix.
		// [TO-DO] Do not forget to bind the program before you set a uniform variable value.

		// scales x/y axis into range [-1, 1]
		// note -y scaling due to top-down aspect of y-axis
		// note translate x/y after scaling
		let trans = [ 2/width,0,0,0,   0,-2/height,0,0,   0,0,1,0,   -1, 1,0,1 ];
		gl.useProgram( this.prog );	// Bind the program
		// set the uniform value in our shader
		gl.uniformMatrix4fv( this.mvp, false, trans);
	}
	updatePoints( pt )
	{
		// [TO-DO] The control points have changed, we must update corresponding uniform variables.
		// [TO-DO] Do not forget to bind the program before you set a uniform variable value.
		// [TO-DO] We can access the x and y coordinates of the i^th control points using
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");

		// gather updated control point locations
		let p = [];
		for (let i = 0; i < 4; i++){
			let x = pt[i].getAttribute("cx");
			let y = pt[i].getAttribute("cy");
			p.push(x);
			p.push(y);
		}

		// send them to the program via uniform var updates
		gl.useProgram( this.prog );
		gl.uniform2f( this.p0, p[0], p[1] );
		gl.uniform2f( this.p1, p[2], p[3] );
		gl.uniform2f( this.p2, p[4], p[5] );
		gl.uniform2f( this.p3, p[6], p[7] );
	}
	draw()
	{
		// [TO-DO] This is where we give the command to draw the curve.
		// [TO-DO] Do not forget to bind the program and set the vertex attribute.

		gl.useProgram( this.prog );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
		gl.vertexAttribPointer( this.times, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray( this.times );
		gl.drawArrays( gl.LINE_STRIP, 0, 100 );
	}
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		// [TO-DO] Replace the following with the proper vertex shader code
		// this is where the Bezier Interpolation goes

		// project the points
		vec4 p0_prime = mvp * vec4(p0, 0, 1);
		vec2 p0_ = p0_prime.xy;

		vec4 p1_prime = mvp * vec4(p1, 0, 1);
		vec2 p1_ = p1_prime.xy;

		vec4 p2_prime = mvp * vec4(p2, 0, 1);
		vec2 p2_ = p2_prime.xy;

		vec4 p3_prime = mvp * vec4(p3, 0, 1);
		vec2 p3_ = p3_prime.xy;

		// (1-t)^3 P_0 + 3(1-t)^2t P_1 + 3(1-t)t^2 P_2 + t^3 P_3
		float t2 = t*t;
		float t3 = t*t*t;
		float one_mt2 = (1.0 - t) * (1.0 - t);
		float one_mt3 = (1.0 - t) * (1.0 - t) * (1.0 - t);
		vec2 curve_point = one_mt3 * p0_ + 3.0 * one_mt2 * t * p1_ + 3.0 * (1.0 - t) * t2 * p2_ + t3 * p3_;

		// send as output
		gl_Position = vec4(curve_point, 0, 1);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,1,1);
	}
`;