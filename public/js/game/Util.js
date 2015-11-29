// tile size , depends on screen later
tile_size = 60;
// where the first road begin
zero_x = 80;
zero_y = 60;

// beginning point of selections of road pieces
selects_x = 600;
selects_y = 0;

// beginning point of instruction queue
inst_x = selects_x+tile_size*3;
inst_y = selects_y;


// size of the actuall game size
var map_size = 5;
// for start and end point
map_size +=2;
var map = [];

// setting directions of road pieces according to image's default direction
dir_dict = {'monster':[-1], 'corner':[2,3], 'end':[2], 'straight':[1,3], 't':[1,2,3], 'tree':[]};
inst_dict = {forward: 0, right: 1, left: 2, for_loop: 3, if_stmt: 4, for_end:5};

function map_bg_init(){
	for (var j = 1; j < map_size-1; j++) {
	    for (var i = 1; i < map_size-1; i++) {
	        var bg = PIXI.Sprite.fromImage('assets/Newburg/floor1.png');
	        bg.x = tile_size * i;
	        bg.y = tile_size * j;
	        bg.height = tile_size;
	        bg.width = tile_size;
	        MAP_STAGE.addChild(bg);
	    };
	}
}

var msg_rec = 0;
var msg_rec_x = 100;
// used for printing message on screen
function show_msg(msg){
    var spinningText = new PIXI.Text(msg, { font: 'bold 25px Arial', align: 'center', stroke: '#FFFFFF', strokeThickness: 5 });

    spinningText.anchor.set(0.5);
    spinningText.x = msg_rec_x;
    spinningText.y = 100 + (msg_rec%20)*30;
    msg_rec ++;
    if(msg_rec %20 == 0){
      msg_rec_x += 40;
    }
    ERROR_STAGE.addChild(spinningText);
}


function game_reset(){

    player.pos_x = player.ox;
    player.pos_y = player.oy;
    player.x = tile_size/2 + tile_size*player.pos_x;
    player.y = tile_size/2 + tile_size*player.pos_y;
    player.xmov = 0;
    player.ymov = 0;

    player.face_dir = player.odir;
    turn_animation(player,player.face_dir);

    execute = false;

    cur_inst = instQueue.head;

    // road pieces can be moved again
    for(var i = 0; i < ROAD_STAGE.children.length; i++){
        ROAD_STAGE.children[i].interactive = true;
    }

    // restore instructions buttons's count
    for(var i = 0; i < INST_BUTTON_STAGE.children.length; i++){
      /*if(INST_BUTTON_STAGE.children[i].generator){

        INST_BUTTON_STAGE.children[i].generator.reset();
      }*/
      var c = INST_BUTTON_STAGE.children[i];
      
        c.interactive = true;
      
      
    }
    var temp_cur = instQueue.head;
    while(temp_cur!=null&&temp_cur.value!=null){
        //show_msg('hh');
        var inst = temp_cur.value;
        if(inst.loop_count!=null){
            //show_msg('h')
            //show_msg('has loop count'+temp_cur.value.o_loop_count);
            inst.loop_count = inst.o_loop_count; 
            inst.loop_txt.setText(inst.loop_count);  
        }
        temp_cur = temp_cur.next;
    }

    ERROR_STAGE.removeChildren();
    
    start_button.interactive = true;
    //instQueue.clear();
    step = 0;
}


// reading instQueue instructions
function execute_inst_queue() {
    switch (cur_inst.value.inst) {
	    case inst_dict.forward:
	        player_move(player.face_dir);
	        break;
	    case inst_dict.left:
	        player.wait = tile_size/player.speed;
	        player.face_dir = (player.face_dir + 3) % 4;
	        turn_animation(player,player.face_dir);
	        break;
	    case inst_dict.right:
	        player.wait = tile_size/player.speed;
	        player.face_dir = (player.face_dir + 1) % 4;
	        turn_animation(player,player.face_dir);
	        break;
        case inst_dict.for_loop:
            var s = cur_inst.value.dec();
            if(s==0){
                //show_msg('hhh');
                for_start = cur_inst;
            }else{
                cur_inst = for_end.next;
                return;
            }
            //show_msg(s);
            break;
        case inst_dict.for_end:
            for_end = cur_inst;
            cur_inst = for_start;
            return;

	    default:
	        break;
	    }

//    last_inst = cur_inst;
    cur_inst = cur_inst.next;

}

function on_map_boarder(x,y){
    return (x == 0 || x == map_size-1 || y == 0 || y == map_size-1);
}

function on_map_corner(x,y){
    var check_x = (x==0 || x==map_size-1);
    var check_y = (y==0 || y==map_size-1);
    return check_y&&check_x;

}



// gather information and make it ready to sent to server
function set_level_data(){

  if(validation()==false){
    show_msg('not valid road, can\'t save');
    return -1;
  }else{
    show_msg('find');
  }

  map_to_pass = [];
  for(i = 0; i<ROAD_ON_MAP_STAGE.children.length; i++){
    r = ROAD_ON_MAP_STAGE.children[i];
    if(r.name =='monster' || r.name =='tree'){
      map_to_pass[r.pos_x+map_size*r.pos_y] = { x:r.x,
                                                y:r.y,
                                                img:r.img,
                                                name:r.name};
    }
  }

    levelInfo = {
      id: 1,
      data: {
      "author": "Sam",
      "title": "Easy Level",
      "description": "This is an entry level",
    "player": {x:player.pos_x, y:player.pos_y, face_dir:player.face_dir},
    "map":map_to_pass

    }};
}

// resolve data from server and construct the game board
function get_level_data(data){
  player.pos_x = data.player.x;
  player.ox = player.pos_x;
  player.pos_y = data.player.y;
  player.oy = player.pos_y;
  player.face_dir = data.player.face_dir;
  player.odir = player.face_dir;
  player.x = player.pos_x *tile_size+tile_size/2;
  player.y = player.pos_y *tile_size+tile_size/2;
  turn_animation(player,player.face_dir);
  //show_msg('get_level_data: ' + data.map.length);
  for(i = 0; i < data.map.length; i++){
    if(m = data.map[i]){
      createMapParts(m.x, m.y, m.img, m.name, false,0);
    }
  }

}

function validation(){

  if(on_map_corner(player.pos_x,player.pos_y)){
    return false;
  }
  
  var cur = player.pos_y*map_size+player.pos_x;
  
  var dir = map[cur][0];

  //player not on any map position
  if(dir==null){
    show_msg('not on map pieces');
    return false;
  }

  if(find_road(player.pos_x,player.pos_y,dir)){
    return true;
  }

  return false;
}

// recursive function to validate road conditions
function find_road(x,y,dir){
  //show_msg('calling');
  var xmov = (2-dir)*dir%2;
  var ymov = (dir-1)*(1-dir%2);
  
  var x = x+xmov;
  var y = y+ymov;
  // get dirs available in new position
  var dirs = map[x + y*map_size];

  var op = (dir+2)%4;

  //player not on a road
  if(dirs==undefined || dirs==[]){
    show_msg('not on road');
    return false;
  }

  if(on_map_boarder(x,y)){
    //show_msg('x: ' + x + 'y: ' + y + 'dir'+dir);
    //show_msg('reach boarder');
    return true;
  }
  // remove the dir just come from
  var index = dirs.indexOf(op);
  if(index > -1){
    //show_msg('dirs before splice' + dirs);
    var removed = dirs.splice(index,1);
    //show_msg('dirs remain:'+ dirs);
  }else{
    show_msg('not valid comming road');
    // comming road is not valid 
    return false;
  }
  
  var res = false;
  //show_msg('in recursion: dir length:'+dirs.length);
  for(var i = 0; i < dirs.length; i++){
    //show_msg('i: ' + i +'length'+  dirs.length);
    //show_msg(dirs.push(removed);
    res = res || arguments.callee(x,y,dirs[i]);
    
  }

  // may find a better way to solve splice modify map ,
  // idea: use slice, but this leads to other bugs.. check types next time
  dirs.push(removed[0]);
  //show_msg(dirs);
  return res;
}
