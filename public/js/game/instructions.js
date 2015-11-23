
/*
function onButtonUp()
{
    this.isdown = false;

    player_start();

    if (this.isOver){
    }
    else{
    }
}

*/


// create reset button
function createResetButton(x,y,img){
  var reset_tex = PIXI.Texture.fromImage(img);
  var reset_button = new PIXI.Sprite(reset_tex);
  reset_button.width = tile_size*2;
  reset_button.height = tile_size;
  reset_button.x = x;
  reset_button.y = y;
  // make the button interactive...
  reset_button.interactive = true;
  reset_button.buttonMode = true;

  reset_button
      // set the mousedown and touchstart callback...
      .on('mousedown', resetButtonDown)
      .on('touchstart', resetButtonDown)

      // set the mouseup and touchend callback...
      .on('mouseup', resetButtonUp)
      .on('touchend', resetButtonUp)
      .on('mouseupoutside', resetButtonUp)
      .on('touchendoutside', resetButtonUp)

      // set the mouseover callback...
      .on('mouseover', resetButtonOver)

      // set the mouseout callback...
      .on('mouseout', resetButtonOut)
      
  reset_button.tap = null;
  reset_button.click = null;
  // add it to the stage
  stage.addChild(reset_button);
  return reset_button;
}


function resetButtonDown()
{
    this.isdown = true;
 //   player_move(1);
    this.alpha = 1;
}

function resetButtonUp()
{
    this.isdown = false;

    game_reset();

    if (this.isOver){
    }
    else{
    }
}

function resetButtonOver()
{
    this.isOver = true;
    if (this.isdown){
        return;
    }
}

function resetButtonOut()
{
    this.isOver = false;
    if (this.isdown){
        return;
    }
}


//reset the game except road pieces
function game_reset() {


    player.x = tile_size;
    player.y = tile_size;
    player.pos_x = 1;
    player.pos_y = 1;
    player_dir = 1;
    start = false;
    // road pieces can be moved again
    for(var i = 0; i < ROAD_STAGE.children.length; i++){
        ROAD_STAGE.children[i].interactive = true;
    }

    // restore instructions buttons's count
    for(var i = 0; i < INST_BUTTON_STAGE.children.length; i++){
      INST_BUTTON_STAGE.children[i].generator.reset();
    }

    INSTRUCT_STAGE.removeChildren();
    /*  OLD
    instQueue = [];
    instPointer = 0;
    */
    instId = 0;
    step = 0;

}



// new instruction buttons 
// followed by map parts

//check if it is in the instruction region
function check_inst_region(x,y,length){
     return x > INSTRUCT_STAGE.x && x < INSTRUCT_STAGE.x+tile_size &&
            y > INSTRUCT_STAGE.y+tile_size/2 &&
            y < INSTRUCT_STAGE.y+tile_size/2+tile_size*(instQueue.length+1);
}

function to_Inst_pos(y){

   return ( Math.floor((y-INSTRUCT_STAGE.y + tile_size/2)/tile_size)-1);
}

function onInstDragStart(event){

    this.data = event.data;
    this.started = true;
    this.alpha = 0.8;
    this.dragging = true;
    if(instQueue.contain(this)){
      instQueue.remove(this);
      show_msg(instQueue.length);
    }

}

function onInstDragEnd(event){

  if(this.started){
    this.dragging = false;
    this.started = false;
    this.alpha = 1;

    if(this.in_region){
      //insert into list depends on position
      var pos = to_Inst_pos(this.y);
      instQueue.insert(pos,this);
      show_msg(instQueue.length);
    }

    instQueue.settle();
  }

}


function onInstDragMove(){
    if (this.dragging)
    {

        var newPosition = this.data.getLocalPosition(this.parent);

        if(check_inst_region(this.x,this.y,instQueue.length)){
          this.in_region = true;
          this.x = newPosition.x - newPosition.x%(tile_size*2) +tile_size;
          this.y = newPosition.y - newPosition.y%tile_size + tile_size/2;

          var temp_pos = to_Inst_pos(this.y);
          if(!this.down){
            instQueue.move_down(temp_pos);
            this.down = true;
          }
          
        }else{
          if(this.down){
            instQueue.move_restore();
            this.down = false;
          }else{
            
          }

          this.in_region = false;
          this.x = newPosition.x;
          this.y = newPosition.y;
        }
    }

}





//create instruction button
function instructionGenerator(x,y,img,name,num){
  // used by createMapParts function
  this.x = x;
  this.y = y;
  this.img = img;
  this.name = name;
  // number of parts
  if(num){
    this.count = num;
  }else{
    this.count = 1;
  }

  indicate = createInstructionParts(this.x,this.y,this.img,this.name,false, instId);
  instId ++;

  var f = createInstructionParts(this.x,this.y,this.img,this.name,true, instId); 
  instId ++;
  f.generator = this;


  var countTxt = new PIXI.Text(':'+this.count);
  countTxt.x = this.x + 60;
  countTxt.y = this.y;
  INST_BUTTON_STAGE.addChild(countTxt);

  this.gen = function(){
    // this is called when moving top pieces
    // when count is one, don't generate a new piece, 
    if(this.count > 1){
      var m = createInstructionParts(this.x,this.y,this.img,this.name,true, instId);
      instId ++; 
      m.generator = this;
      this.count --;
    }else{
      this.count = 0;
    }
    this.update();
  }
  
  this.update = function(){
    countTxt.setText(':'+this.count);
  }

}


function createInstructionParts(x,y,img, name, active, idnum){
  var tex_instruct = PIXI.Texture.fromImage(img);
  var part = new PIXI.Sprite(tex_instruct);
 
  part.interactive = active;
  part.buttonMode = true;
  part.anchor.set(0.5);
  part.width = tile_size*2;
  part.height = tile_size;
  part.position.x = x;
  part.position.y = y;
  part.idnumber = idnum;
  // to distinguish between turning road and dragging road 
  part.dragged = false;
  // when it is being created, the piece is fresh,
  // used to maintain the counts for same type of piece
  part.fresh = true;
  part.started = false;
  // position on map
  part.pos_x = -1;
  part.pos_y = -1;
  part.name = name;
  //part.dir = dir_dict[name];

  // these variables are only used for creating 
  // another road
  //part.img = img;
  //part.ox = x;
  //part.oy = y;


  part
    // events for drag start
    .on('mousedown', onInstDragStart)
    .on('touchstart', onInstDragStart)
    // events for drag end
    .on('mouseup', onInstDragEnd)
    .on('mouseupoutside', onInstDragEnd)
    .on('touchend', onInstDragEnd)
    .on('touchendoutside', onInstDragEnd)
    // events for drag move
    .on('mousemove', onInstDragMove)
    .on('touchmove', onInstDragMove);//haha
  INST_BUTTON_STAGE.addChild(part);
  
  return part;
}
