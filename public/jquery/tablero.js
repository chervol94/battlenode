$(document).ready(function(){
  for(x=0;x<ArrCeldas.length;x++){//Recorremos el array de celdas
    ArrCeldas[x].click(function(){//Si se hace click
      for(y=0;y<ArrCeldas.length;y++){// re recorremos el array
        if(this == ArrCeldas[y]){// si coincide
          //alert(this+y);
          placeShip(select,y,rotation);//Llamamos a colocar barco y le pasamos el tipo de barco, la posicion del click y la rotacion de este
        }
      }
    });
    rotation = 0;//variable que indica la posicion (V/H) en la que se colocara el barco
    select = 0;//Variable que indica que tipo de barco se ha seleccionado
    cantb2 = 0;//Cantidad de barcos de tipo Patrulla
    cantb3 = 0;//Cantidad de barcos de tipo Destructor
    cantb4 = 0;//Cantidad de barcos de tipo Submarino
    cantb5 = 0;//Cantidad de barcos de tipo Batlesship
    allready = 0;//Variable que indicara si todos nuestros barcos estan listos
    allreadyen = 0;//Variable que indicara que todos los barcos del enemigo estan listos
    ships = [
   		{'tipo': 'Battleship', 'size': 5, 'hundido': false, 'disp': 1, 'posicion' : []},
   		{'tipo': 'Submarino', 'size': 4, 'hundido': false, 'disp': 2, 'posicion' : []},
   		{'tipo': 'Destructor', 'size': 3, 'hundido': false, 'disp': 3, 'posicion' : []},
   		{'tipo': 'Patrulla', 'size': 2, 'hundido': false, 'disp': 2, 'posicion' : []}
   	];//Array que guarda los datos de barcos antes de pasarlos al objeto del servidor
    shipsEn =[];//Array que guardara los datos de los barcos de los enemigos
    SyncAll();//Llamamos a una sincronizacion total
  }
  for(x=0;x<ArrCeldasEn.length;x++){//Recorremos el array de celdas del enemigo
    ArrCeldasEn[x].click(function(){//Si se hace click
      for(y=0;y<ArrCeldasEn.length;y++){//re recorremos para obtener la posicion
        if(this == ArrCeldasEn[y]){//Si coincide
          tirar(y);//Tiramos
        }
      }
    });
  }
  function checkAllReady(){
    //alert(cantb2+" "+cantb3+" "+cantb4+" "+cantb5);
    if(cantb2==2 && cantb3==3 && cantb4==2 && cantb5==1){//Si se han colocado todos los barcos
      pilot.attr("fill","green");//Indicamos cambiando el color de la bombilla
      allready = 1;//Cambiamos la variable local
      socket.emit("SendShips",ships);//Enviamos los barcos al servidor
    }
  }
  function tirar(posicion){//Efectuamos disparo
    if(allready == 1 && allreadyen == 1){//Si todos los barcos estan debidamente colocados
        if(ArrCeldasEn[posicion].attr("s") == 1){//Si esa celda ya ha sido marcada como tiro efectuado
          alert("Ya has disparado aqui, elige otra posicion");//Indicamos que ya se ha disparado
        }else{
          socket.emit("turn",posicion);//Ejecutamos el tiro
        }

    }
  }
  socket.on("ShipDamaged",function(pos){//si el server emite barco dañado
    //ArrCeldas[pos].attr("fill","red");//MArcamos esa celda de rojo
    var audiohit = new Audio("../sound/hit.wav");//Creamos el elemento que reproducira el audio de hit cuando nos disparan
    audiohit.play();//reproducimos
    ArrCeldas[pos].attr({
      opacity : 0.5,
      fill : "red"
    });
  });
  socket.on("ShipNotDamaged",function(pos){//Si el server emite agua
    //ArrCeldas[pos].attr("fill","cyan");//Marcamos esa celda de azul
    var audiomiss = new Audio("../sound/water.wav");//Creamos el elemento que reproducira el audio de miss cuando nos disparan
    audiomiss.play();
    ArrCeldas[pos].attr({
      opacity : 0.5,
      fill : "cyan"
    });
  });
  socket.on("turnRet",function(ret){//Cuando el server detecta disparo nos devuelve los datos para mostrarlos en el tablero Propio del enemigo
    var hit=0;//Variable que indicara si se ha dado a un barco o no
    for(var z = 0;z<shipsEn.length;z++){//Recorremos ShipsEn
      for(var l = 0;l<shipsEn[z].posicion.length;l++){//Recorremos posicion
        //alert(ships[z].posicion[l]);
        barcoactual = shipsEn[z].posicion[l].toString();//Convertimos las posiciones de posicion a string
        var positionsship = barcoactual.split(",");//Hacemos un split para tenerlas individualmente
        //alert(positionsship.length);
        for(var t = 1;t<positionsship.length;t++){//recorremos esas posiciones individualmente
          //alert("Posicion buscada"+positionsship[t]);
          //if(positionsship[t]!= 0){
            //alert(ret+" "+positionsship[t]);
            if(ret == positionsship[t]){//Si la posicion del disparo coincide con alguna guardada en posiciones
              hit = 1;//Tocado
            }
          //}
        }
      }
    }
    if(hit==1){//Si se ha tocado
      //alert("Tocado");
      var audiohit = new Audio("../sound/hit.wav");//Creamos el elemento que reproducira el efecto de sonido cuando se dispara y se acierta
      audiohit.play();//Reproducimos
      ArrCeldasEn[ret].attr({
        opacity : 0.5,
        s : 1,
        fill : "red"
      });
    }else{
      //alert("Agua");
      var audiomiss = new Audio("../sound/water.wav");//Creamos el elemento que reproducira el efecto de sonido cuando se dispara y se falla
      audiomiss.play();//Reproducimos
      ArrCeldasEn[ret].attr({
        opacity : 0.5,
        s : 1,
        fill : "cyan"
      });
    }
  //alert("Has disparado en:"+ret);
  });
  socket.on("SendShipsRet",function(ShipsRecibidos){//Cuando el server nos manda los datos de los barcos enemigos
    pilotEn.attr("fill","green");//Indicamos que el enemigo esta listo
    shipsEn = ShipsRecibidos;//Pasamos esos datos al array de enemigos del cliente
    //alert(ShipsRecibidos[3].posicion[0]);
    allreadyen = 1;//Indicamos que el enemigo esta listo
    socket.emit("CheckStartPlay");//emitimos que empezamos a jugar
  })
  function SyncAll(){//En esta funcion obtenemos las cantidades de barcos que tendremos de cada tipo
    $("#b2res").html(ships[3].disp);//Indicamos cantidad
    $("#b3res").html(ships[2].disp);//Indicamos cantidad
    $("#b4res").html(ships[1].disp);//Indicamos cantidad
    $("#b5res").html(ships[0].disp);//Indicamos cantidad
    if(rotation==0){//Si es Horizontal
      $("#posact").html("H");//Indicamos que es Horizontal
    }else{
      $("#posact").html("V");//Indicamos que es vertical
    }

  }
  function comprobar(tipo,posini,rotacion){//Funcion para comprobar si hay barcos en una posicion donde se ha clicado
    var barcoactual;//variable que almacenará la posicion del barco el cual se esta comprobando
    var sum;//variable que contendra la cantidad que se suma para la comprobacion de barcos en esa posicion
    var posicion;
    var posf;
    if(tipo == 2){//Si el tipo es patrulla
      posicion = 3;//Indicamos en que dimension esta su array en barcos
    }
    if(tipo == 3){//Si el tipo es Destructor
      posicion = 2;//Indicamos en que dimension esta su array en barcos
    }
    if(tipo == 4){//Si el tipo es submarino
      posicion = 1;//Indicamos en que dimension esta su array en barcos
    }
    if(tipo == 5){//Si el tipo es battleship
      posicion = 0;//Indicamos en que dimension esta su array en barcos
    }
    if(rotacion == 0){//Si es horizontal
      sum = 1;//Se sumara 1
    }else{//Sino, es que es vertical
      sum = 9;//Se sumara 9
    }
    for(var z = 0;z<ships.length;z++){//Recorremos nuestros barcos
      for(var l = 0;l<ships[z].posicion.length;l++){//recorremos posicion para saver cuantos barcos hay de ese tipo
        //alert(ships[z].posicion[l]);
        barcoactual = ships[z].posicion[l].toString();//Almacenamos esas posiciones en una variable a la vez que la pasamos a string
        var positionsship = barcoactual.split(",");//Hacemos un split
        //alert(positionsship.length);
        for(var t = 1;t<positionsship.length;t++){//Recorremos ese split
          //alert("Posicion buscada"+positionsship[t]);
          if(positionsship[t]!= 0){//saltandonos la primera posicion ya que siempre almacena null por la colocacion de las comas en barcoactual
          posf = posini;//pasamos la posicion inicial a otra variable
          for(var b = 0;b<ships[posicion].size-1;b++){//recorremos por el tamaño del barco indicado en el array de barcos
            //alert("posbuscada"+positionsship[t]+" posini"+posf);
            if(b == 0){//en la primera iteracion del for entramos para no sumar ninguna posicion a la que ya tenemos
              if(positionsship[t] == posf){//Si la posicion del split es igual a la posicion que se ha disparado
                return true;//devolvemos hay barco

              }
            }
            posf = parseInt(posf)+parseInt(sum);//Sumamos sum a posf
            if(positionsship[t] == posf){//Si coincide
              return true;//devolvemos true
            }

          }
        }
        }

      }

    }

    return false;//sino hay match devolvemos falso
  }
  function placeShip(tipo,posini,rotacion){
    //alert(posini);
    var res = comprobar(tipo,posini,rotacion);//llamamos a la funcion para comprobar si donde queremos colocar ya hay un barco
    //alert(res);
    if(allready == 0 && res==false){//Si no estan listos todos los barcos y la comprobacion anterior ha dado negativo ejecutamos las condiciones de colocacion para no salirnos del tablero
    if(tipo==2 && rotacion == 0 && (posini+1)%9==0){//Si es barco de tipo patrulla, en horizontal y su posicion mas 1 es mod de 9
      alert("El barco no se puede colocar ahi");
    }else if (tipo==3 && rotacion == 0 && ((posini+1)%9==0 || (posini+2)%9==0)) {//Sumamos la cantidad de posiciones que hay de distancia al borde para igualar siempre 9 a la celda seleccionada
      alert("El barco no se puede colocar ahi");
    }else if (tipo==4 && rotacion == 0 && ((posini+1)%9==0 || (posini+2)%9==0 || (posini+3)%9==0 )) {
      alert("El barco no se puede colocar ahi");
    }else if (tipo==5 && rotacion == 0 && ((posini+1)%9==0 || (posini+2)%9==0 || (posini+3)%9==0 || (posini+4)%9==0 )) {
      alert("El barco no se puede colocar ahi");
    }else if (tipo==2 && rotacion == 1 && posini+9>80) {
      alert("El barco no se puede colocar ahi");
    }else if (tipo==3 && rotacion == 1 && posini+9>71) {
      alert("El barco no se puede colocar ahi");
    }else if (tipo==4 && rotacion == 1 && posini+9>62) {
      alert("El barco no se puede colocar ahi");
    }else if (tipo==5 && rotacion == 1 && posini+9>53) {
      alert("El barco no se puede colocar ahi");
    }else{
    switch(tipo){
      case 2:
        if(ships[3].disp != 0){//Si hay barcos disponibles
          //ArrCeldas[posini].attr("fill","grey");
          var posxini = ArrCeldas[posini].attr("x");//obtenemos el atributo x de la celda
          var posyini = ArrCeldas[posini].attr("y");// y el y
          ships[3].posicion[cantb2] = new Array(1);//creamos un nuevo array en la posicion
          ships[3].posicion[cantb2].push(posini);//colocamos la posicion de la primera celda en el array
          if(rotacion == 1){// si es rotacion verical
            for(z=0;z<1;z++){// realizamos u bucle x la cantidad de celdas del barco
              posini = posini+9;//Agregamos 9 a la posicion actual para obtener la celda inferior

              ships[3].posicion[cantb2].push(posini);// hacemos un push en el array
              //ArrCeldas[posini].attr("fill","grey");
            }
          }else{//si es horizontal
            for(z=0;z<1;z++){// mismo bucle x la cantidad de barcos
              posini = posini+1;// sumamos para horizontal
              ships[3].posicion[cantb2].push(posini);//pusheamos en el array
              //ArrCeldas[posini].attr("fill","grey");
            }
          }
          //alert(ships[3].tipo+posxini+posyini);
          if(rotacion == 1){//si es vertical
            var posxinisum = parseInt(posxini)+30;//al sprite del barco lo colocamos i sumamos 30 en eje x
            var posxfin = posxinisum+"px";//añadimos px al numero
            var posyinisum = parseInt(posyini)+180;//al sprite del barco le sumamos 180 en eje y
            var posyfin = posyinisum+"px";//sumamos px al numero
            var id = "#b2d"+ships[3].disp;//elegimos la id de la imagen
            $(id).css("display","inline");//la desocultamos
            $(id).css("transform","rotate(90deg)");//la rotamos
          }else{//si es horizontal
            var posxinisum = parseInt(posxini)+60;//sumamos 60 al eje x
            var posxfin = posxinisum+"px";//añadimos px
            var posyinisum = parseInt(posyini)+160;//sumamos 160 al eje y
            var posyfin = posyinisum+"px";//añadimos px
            var id = "#b2d"+ships[3].disp;//cojemos la id
            $(id).css("display","inline");//lo desocultamos

          }
          $(id).css("left",posxfin);//colocamos en la posicion
          $(id).css("top",posyfin);//colocamos en la posicion
          ships[3].disp--;//restamos el barco colocado
          //alert(ships[3].posicion[cantb2]);
          cantb2++;
          $("#b2res").html(ships[3].disp);//Actualizamos la cantidad de barcos que quedan por colocar
          checkAllReady();//Comprobaremos si estan todos los barcos colocados

        }
      break;
      case 3:
        if(ships[2].disp != 0){
          //ArrCeldas[posini].attr("fill","grey");//en la posicion que se ha clicado ponemos color de fondo
          var posxini = ArrCeldas[posini].attr("x");//obtenemos el atributo x de la celda
          var posyini = ArrCeldas[posini].attr("y");// y el y
          ships[2].posicion[cantb3] = new Array(1);//creamos un nuevo array en la posicion
          ships[2].posicion[cantb3].push(posini);//colocamos la posicion de la primera celda en el array
          if(rotacion == 1){// si es rotacion verical
            for(z=0;z<2;z++){// realizamos u bucle x la cantidad de celdas del barco
              posini = posini+9;//Agregamos 9 a la posicion actual para obtener la celda inferior
              ships[2].posicion[cantb3].push(posini);// hacemos un push en el array
              //ArrCeldas[posini].attr("fill","grey");// pintamos esa celda
            }
          }else{//si es horizontal
            for(z=0;z<2;z++){// mismo bucle x la cantidad de barcos
              posini = posini+1;// sumamos para horizontal
              ships[2].posicion[cantb3].push(posini);//pusheamos en el array
              //ArrCeldas[posini].attr("fill","grey");//pintamos la celda
            }
          }
          //alert(ships[2].tipo+posxini+posyini);
          if(rotacion == 1){//si es vertical
            var posxinisum = parseInt(posxini)+10;//al sprite del barco lo colocamos i sumamos 30 en eje x
            var posxfin = posxinisum+"px";//añadimos px al numero
            var posyinisum = parseInt(posyini)+210;//al sprite del barco le sumamos 180 en eje y
            var posyfin = posyinisum+"px";//sumamos px al numero
            var id = "#b3d"+ships[2].disp;//elegimos la id de la imagen
            $(id).css("display","inline");//la desocultamos
            $(id).css("transform","rotate(90deg)");//la rotamos
          }else{//si es horizontal
            var posxinisum = parseInt(posxini)+60;//sumamos 60 al eje x
            var posxfin = posxinisum+"px";//añadimos px
            var posyinisum = parseInt(posyini)+160;//sumamos 160 al eje y
            var posyfin = posyinisum+"px";//añadimos px
            var id = "#b3d"+ships[2].disp;//cojemos la id
            $(id).css("display","inline");//lo desocultamos

          }
          $(id).css("left",posxfin);//colocamos en la posicion
          $(id).css("top",posyfin);//colocamos en la posicion
          ships[2].disp--;//restamos el barco colocado
          //alert(ships[2].posicion[cantb3]);
          cantb3++;
          $("#b3res").html(ships[2].disp);//Actualizamos la cantidad de barcos que quedan por colocar
          checkAllReady();//Comprobaremos si estan todos los barcos colocados
        }
      break;
      case 4:
        if(ships[1].disp != 0){
          if(ships[1].disp != 0){
            //ArrCeldas[posini].attr("fill","grey");//en la posicion que se ha clicado ponemos color de fondo
            var posxini = ArrCeldas[posini].attr("x");//obtenemos el atributo x de la celda
            var posyini = ArrCeldas[posini].attr("y");// y el y
            ships[1].posicion[cantb4] = new Array(1);//creamos un nuevo array en la posicion
            ships[1].posicion[cantb4].push(posini);//colocamos la posicion de la primera celda en el array
            if(rotacion == 1){// si es rotacion verical
              for(z=0;z<3;z++){// realizamos u bucle x la cantidad de celdas del barco
                posini = posini+9;//Agregamos 9 a la posicion actual para obtener la celda inferior
                ships[1].posicion[cantb4].push(posini);// hacemos un push en el array
                //ArrCeldas[posini].attr("fill","grey");// pintamos esa celda
              }
            }else{//si es horizontal
              for(z=0;z<3;z++){// mismo bucle x la cantidad de barcos
                posini = posini+1;// sumamos para horizontal
                ships[1].posicion[cantb4].push(posini);//pusheamos en el array
                //ArrCeldas[posini].attr("fill","grey");//pintamos la celda
              }
            }
            //alert(ships[1].tipo+posxini+posyini);
            if(rotacion == 1){//si es vertical
              var posxinisum = parseInt(posxini)-15;//al sprite del barco lo colocamos i sumamos 30 en eje x
              var posxfin = posxinisum+"px";//añadimos px al numero
              var posyinisum = parseInt(posyini)+230;//al sprite del barco le sumamos 180 en eje y
              var posyfin = posyinisum+"px";//sumamos px al numero
              var id = "#b4d"+ships[1].disp;//elegimos la id de la imagen
              $(id).css("display","inline");//la desocultamos
              $(id).css("transform","rotate(90deg)");//la rotamos
            }else{//si es horizontal
              var posxinisum = parseInt(posxini)+60;//sumamos 60 al eje x
              var posxfin = posxinisum+"px";//añadimos px
              var posyinisum = parseInt(posyini)+160;//sumamos 160 al eje y
              var posyfin = posyinisum+"px";//añadimos px
              var id = "#b4d"+ships[1].disp;//cojemos la id
              $(id).css("display","inline");//lo desocultamos

            }
            $(id).css("left",posxfin);//colocamos en la posicion
            $(id).css("top",posyfin);//colocamos en la posicion
            ships[1].disp--;//restamos el barco colocado
            //alert(ships[1].posicion[cantb4]);
            cantb4++;
            $("#b4res").html(ships[1].disp);//Actualizamos la cantidad de barcos que quedan por colocar
            checkAllReady();//Comprobaremos si estan todos los barcos colocados
          }
        }
      break;
      case 5:
        if(ships[0].disp != 0){
          //ArrCeldas[posini].attr("fill","grey");//en la posicion que se ha clicado ponemos color de fondo
          var posxini = ArrCeldas[posini].attr("x");//obtenemos el atributo x de la celda
          var posyini = ArrCeldas[posini].attr("y");// y el y
          ships[0].posicion[cantb5] = new Array(1);//creamos un nuevo array en la posicion
          ships[0].posicion[cantb5].push(posini);//colocamos la posicion de la primera celda en el array
          if(rotacion == 1){// si es rotacion verical
            for(z=0;z<4;z++){// realizamos u bucle x la cantidad de celdas del barco
              posini = posini+9;//Agregamos 9 a la posicion actual para obtener la celda inferior
              ships[0].posicion[cantb5].push(posini);// hacemos un push en el array
              //ArrCeldas[posini].attr("fill","grey");// pintamos esa celda
            }
          }else{//si es horizontal
            for(z=0;z<4;z++){// mismo bucle x la cantidad de barcos
              posini = posini+1;// sumamos para horizontal
              ships[0].posicion[cantb5].push(posini);//pusheamos en el array
              //ArrCeldas[posini].attr("fill","grey");//pintamos la celda
            }
          }
          //alert(ships[0].tipo+posxini+posyini);
          if(rotacion == 1){//si es vertical
            var posxinisum = parseInt(posxini)-40;//al sprite del barco lo colocamos i sumamos 30 en eje x
            var posxfin = posxinisum+"px";//añadimos px al numero
            var posyinisum = parseInt(posyini)+250;//al sprite del barco le sumamos 180 en eje y
            var posyfin = posyinisum+"px";//sumamos px al numero
            var id = "#b5d"+ships[0].disp;//elegimos la id de la imagen
            $(id).css("display","inline");//la desocultamos
            $(id).css("transform","rotate(90deg)");//la rotamos
          }else{//si es horizontal
            var posxinisum = parseInt(posxini)+60;//sumamos 60 al eje x
            var posxfin = posxinisum+"px";//añadimos px
            var posyinisum = parseInt(posyini)+160;//sumamos 160 al eje y
            var posyfin = posyinisum+"px";//añadimos px
            var id = "#b5d"+ships[0].disp;//cojemos la id
            $(id).css("display","inline");//lo desocultamos

          }
          $(id).css("left",posxfin);//colocamos en la posicion
          $(id).css("top",posyfin);//colocamos en la posicion
          ships[0].disp--;//restamos el barco colocado
          //alert(ships[0].posicion[cantb5]);
          cantb5++;
          $("#b5res").html(ships[0].disp);//Actualizamos la cantidad de barcos que quedan por colocar
          checkAllReady();//Comprobaremos si estan todos los barcos colocados
        }
      break;
    }
  }
}else{
  alert("Todos los barcos colocados i/o posicion no correcta");
}


  }
  $("#b2").attr("src","/images/barcos/b2.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b3").attr("src","/images/barcos/b3.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b4").attr("src","/images/barcos/b4.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b5").attr("src","/images/barcos/b5.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#snap").attr("style","background-image: url(/images/pruebafondo.jpg)");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#snap2").attr("style","background: url(/images/pruebafondo.jpg) 501px 0px");
  $("#rotate").attr("src","/images/barcos/rotate.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b2d1").attr("src","/images/barcos/b2.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b2d2").attr("src","/images/barcos/b2.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b3d1").attr("src","/images/barcos/b3.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b3d2").attr("src","/images/barcos/b3.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b3d3").attr("src","/images/barcos/b3.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b4d1").attr("src","/images/barcos/b4.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b4d2").attr("src","/images/barcos/b4.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido
  $("#b5d1").attr("src","/images/barcos/b5.png");//Aplicamos la URL a la imagen ya que no se puede definir desde HTML sin que de error de ArrCeldas not defined, pese a que este definido

  $("#rotate").click(function(){//Si se hace click en rotar
    if(rotation == 1){//Si es vertical
      rotation = 0;//cambiamos a hor
      $("#posact").html("H");//lo indicamos
    }else{
      rotation = 1;//cambiamos a vertical
      $("#posact").html("V");//indicamos
    }
    //alert(rotation);
  });
  $("#b2").click(function(){//si selecciona el patrulla
    select = 2;//indicamos la seleccion
    //alert(select);
  });
  $("#b3").click(function(){//si selecciona el Destructor
    select = 3;//indicamos la seleccion
    //alert(select);
  });
  $("#b4").click(function(){//si selecciona el Submarino
    select = 4;//indicamos la seleccion
    //alert(select);
  });
  $("#b5").click(function(){//si selecciona el battleship
    select = 5;//indicamos la seleccion
    //alert(select);
  });
});
