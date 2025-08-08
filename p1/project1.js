// TODO: does not accomodate images of smaller size, makes them repeat 
// What is the problem?

// only draw fgImg that lies on bgImg
function isBlendablePixel( pos_fg_xy, pos_fg_xy0, fg_img_w, fg_img_h, wrapImgXAxis = false ){
  /*
  Returns whether we are in a blendable spot (fg overlaps with bg)

  We only ever loop within the canvas, so this checks if there is overlap between canvas and fg image
  */

  let x_fg = pos_fg_xy.x;
  let y_fg = pos_fg_xy.y;

  let x0_fg = pos_fg_xy0.x;
  let y0_fg = pos_fg_xy0.y;

  // 1) have we reached fg?
  // 2) is fg within bounds?
  // fun "bug" I found, by not checking for out of bounds on canvas, this can simply wrap around on x axis, only x-axis though... strange
  // smh shipped in an undefined so that was simply evaluating to true???
  if (wrapImgXAxis){
    return true;
  }
  if ( x_fg < 0 || x_fg >= fg_img_w ){
    return false;
  }
  else if ( y_fg < 0 || y_fg >= fg_img_h ){
    return false;
  }
  return true;
}


function getAdjustedPos( cur_i, fg_pos, adj_pos ){
  /*
  Retrieves where we are on canvas with reference to fg image
   */
  let x0 = fg_pos.x;
  let y0 = fg_pos.y;

  let bg_x = ( cur_i / 4 ) % canvas.width;
  let bg_y = Math.floor( ( cur_i / 4 ) / canvas.width );

  adj_pos.x = bg_x - fg_pos.x;
  adj_pos.y = bg_y - fg_pos.y;

  return adj_pos;

}

function composite( bgImg, fgImg, fgOpac, fgPos )
{
  // bgImg is the background image to be modified.
  // fgImg is the foreground image.
  // fgOpac is the opacity of the foreground image.
  // fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
  
  console.log(fgImg.width);
  console.log(fgImg.height);
  console.log(fgPos.x + fgImg.width);
  console.log(fgPos.y + fgImg.height);

  // interlaced RGBA
  // RGBA is in [0, 255], hence need to adjust for this with flooring/ceiling
  // for now assumes images of same size
  for (let i = 0; i < bgImg.data.length - 4; i+=4){

    let adjPos = {
      'x': 0,
      'y': 0,
    }

    adjPos = getAdjustedPos( i, fgPos, adjPos );  

    // console.log(adjPos);
    //
    // if (i === 500){
    //   break;
    // }
    
    // just draw bg img, which is already drawn, no changes needed
    if ( !isBlendablePixel( adjPos, fgPos, fgImg.width, fgImg.height )){
      continue
    }

    // we are looping wrt canvas indices, so these don't need to change
    let bg_r = bgImg.data[i];
    let bg_g = bgImg.data[i+1];
    let bg_b = bgImg.data[i+2];
    let bg_a = bgImg.data[i+3];

    // need to convert to relevant fg pixels   
    let fg_ind = 4 * adjPos.x + 4 * fgImg.width * adjPos.y;
    let fg_r = fgImg.data[fg_ind];
    let fg_g = fgImg.data[fg_ind+1];
    let fg_b = fgImg.data[fg_ind+2];
    let fg_a = fgImg.data[fg_ind+3];
   
    // [0,1] range
    fg_a /= 255;
    bg_a /= 255;

    // scale by fgOpac
    fg_a *= fgOpac;
    
    let new_alpha = fg_a + bg_a*(1 - fg_a);

    // scale back
    new_alpha *= 255;

    // gives: new_alpha * col_out
    let new_pixel_r = Math.min(255, fg_a * fg_r + (1 - fg_a) * bg_a *  bg_r);
    let new_pixel_g = Math.min(255, fg_a * fg_g + (1 - fg_a) * bg_a *  bg_g);
    let new_pixel_b = Math.min(255, fg_a * fg_b + (1 - fg_a) * bg_a *  bg_b);

    // only change if we can see something
    if (new_alpha > 0){
      bgImg.data[i] = Math.floor(new_pixel_r);
      bgImg.data[i+1] = Math.floor(new_pixel_g);
      bgImg.data[i+2] = Math.floor(new_pixel_b);
      bgImg.data[i+3] = Math.floor(new_alpha);
    }
  }
}
