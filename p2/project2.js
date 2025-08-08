// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
  // col1 = arr[0:3]
  // col2 = arr[4:5]
  // col3 = arr[6:8]
  
  // scale 
  /*
   [
   [a, 0, 0],
   [0, e, 0],
   [0, 0, 1],
   ]
   */

  // rotation 
  /*
    [
    [cos(a), -sin(a), 0],
    [sin(a), cos(a),  0],
    [0,      0,       1]
    ]
   */

  // translation
  /*
   [
   [0, 0, xt],
   [0, 0, yt],
   [0, 0, 1]
   ]
   */
  let scaleMat = Array(0, 0, 0, 0, 0, 0, 0, 0, 0); 
  let rotMat = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
  let transMat = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
  // fill scale matrix
  ScaleMatrix(scale, scaleMat);
  // fill rotation matrix
  RotationMatrix(rotation, rotMat);
  // fill translation matrix
  TranslationMatrix(positionX, positionY, transMat);

  let result1 = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
  let result2 = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
  
  // RotMat * ScaleMat
  SquareMatrixMult(rotMat, scaleMat, result1);

  // transMat * result1 = transMat * RotMat * ScaleMat * (x, y, 1)
  SquareMatrixMult(transMat, result1, result2);

  return result2;
}

function ScaleMatrix(scale, mat){
  mat[0] += scale;
  mat[4] += scale;
  mat[8] += 1;
}

// Fills the appropriate rotation matrix
function RotationMatrix(rotation, mat){
  // degrees to radian for Math.trig 
  rotation = rotation * Math.PI / 180;
  mat[0] += Math.cos(rotation);
  mat[1] += Math.sin(rotation);
  mat[3] += -1*Math.sin(rotation);
  mat[4] += Math.cos(rotation);
  mat[8] += 1;
}

function TranslationMatrix(translationX, translationY, mat){
  mat[0] += 1;
  mat[4] += 1;
  mat[6] += translationX;
  mat[7] += translationY;
  mat[8] += 1;
}

// Matrix multiplication of 1d arrays of len(n^2), where n = col/row length
function SquareMatrixMult(left_mat, right_mat, result, size=3){
  // result[i, j] = sum_k(left_mat_ik * right_mat_kj)
  // right now expects a zero-initialized array 
  for (let i = 0; i < size; i++){
    for (let j = 0; j < size; j++){
      for (let k = 0; k < size; k++){
        result[i + j*size] += left_mat[i + k*size] * right_mat[k + j*size];
      }
    }
  }
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{ 
  let result = Array(0,0,0,0,0,0,0,0,0);
  SquareMatrixMult(left_mat=trans2, right_mat=trans1, result=result);
  return result;
}
