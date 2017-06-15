var socket = io.connect("192.168.12.138:8080",{"forceNew":true});//Abrimos una conexion con el servidor

window.onload = function(){
  var audio = new Audio("../../sound/music.wav");//Creamos el elemento que reproducira la cancion de fondo
  audio.play();//la reproducimos
  audio.loop = true;//Indicamos que la reproduzca en loop
  checkAvailable();//Comprobamos la disponibilidad del juego
  var board = Snap(snap);//Creamos una variable para trabajar con Snap.svg
  var board2 = Snap(snap2);
  ArrCeldas = [];//Array que alamacenara las celdas de el campo
  ArrCeldasEn = [];//Array que almacenara las celdas del enemigo
  var pos = 0;//Posicion de las celdas en el array
  createBoard(0,0,"transparent");//Creamos un tablero
  createPilot(470,25,"red");
  createBoard2(50,0,"transparent");//Creamos otro tablero
  createPilot2(25,25,"red");
  //alert(socket.url);
  function checkAvailable(){
    var reta;
    socket.emit("checkAvailable",reta);//Le pedimos al servidor que compruebe la disponibilidad del juego
  }
  function generateName(){//Pedimos el nombre al usuario

    var userName = prompt("Porfavor introduzca su nombre");//Mostramos un prompt al usuario para que indique su nombre
    if(userName == "" || userName == null){//Si lo deja vacio o Cancela
      var ArrayNamesPredt = ["Edward Smith","Sparrow","BlackBeard","Salazar","Barbosa","Monkey D. Luffy","Garfio"];//Tenemos una serie de nombres predeterminados
      var num = Math.floor(Math.random() * 7) + 1;//Hacemos un random para seleccionar uno
      num--;//Le restamos uno para encajarlo en las posiciones del array
      userName = ArrayNamesPredt[num];//Le agregamos un nombre cualquiera
    }
    var unserNameFinal = "Cpt. "+userName;//Le agregamos al nombre el prefijo de Capitan para darle un toque naval.
    socket.emit("nombre",unserNameFinal);//Enviamos el server el userName
  }
  socket.on("nombreret",function(ret){//Cuando obtenemos respuesta del Srv escribimos el nombre
    $("#nombreUsr").html(ret);
  });
  socket.on("gameintr",function(ret){//Cuando recibimos la respuesta
    alert("Enemigo desconectado, volviendo a la pantalla de inicio");//Avisamos al jugador
    window.location.replace("http://192.168.12.138:8080");//Lo rederigimos a la raiz de la web
  });
  function generateImg(){//Generamos la imagen del usuario
    socket.emit("generateImg");//Emitimos al servidor el evento
  }
  socket.on("generateImgRet",function (data){//Cuando el servidor nos responde a la generacion de imagen
    $("#imgUsr").attr("src",data);//Asignamos la url a la imagen
  });
  socket.on("checkAvailableRet",function(reta){//Cuando el servidor emite la respuesta a checkAvailable ejecutamos esta funcion
    if(reta == 0){// Si la respesta del servidor es negativa
      alert("Lo sentimos, ya hay una partida en proceso");//Avisamos al jugador de que no puede jugar aun
      window.location.replace("http://192.168.12.138:8080");  //Redirigimos a la raiz.
    }else{
        generateName();//Sino permitimos el acceso y generamos el nombre de usuario
        generateImg();//Generamos la imagen de usuario

    }
  });
  socket.on("EnemyFound",function(resp){//Cuando el servidor emita que hemos encontrado un enemigo
    $("#status").html("Enemigo Encontrado");//Se lo indicamos a los jugadores
    socket.emit("GetEnemyName");//Aprovechamos que ambos clientes reciben esta orden a la vez para obtener del servidor el nombre del otro jugador, y asi poder mostrarlo
    socket.emit("GetEnemyImg");//Obtenemos también la imagen del enemigo para mostrarla
  })
  socket.on("GetEnemyNameRet",function(resp){//Una vez el servidor nos responda con el emit del nombre del enemigo
    $("#nombreEn").html(resp);//Se lo aplicamos a cada jugador
  });
  socket.on("GetEnemyNameRepeat",function(){
    socket.emit("GetEnemyName");
  });
  socket.on("EndGameWin",function(){//Indicamos al cliente que gana
    alert("Has ganado, enhorabuena, entras en el Ranking");
    window.location.replace("http://192.168.12.138:8080/rank")//redirigimos al ranking
  });
  socket.on("EndGameLose",function(){//Indicamos al cliente que pierde
    alert("Has perdido, desgraciadamente no entras en el Ranking");
    window.location.replace("http://192.168.12.138:8080");//redirigimos a raiz
  });
  socket.on("StartGame",function(){//Cuando el servidor emite Start Game
    $("#status").html("Empieza el juego");//Anunciamos que empieza el juego
  });
  socket.on("YourTurn",function(){//Cuando el servidor nos indica que es nuestro turno
    $("#status").html("Nos toca atacar!");//Avisamos de que es nuestro turno
    $("#statusT").html("&zwnj;");
  });
  socket.on("NotYourTurn",function(){//Cuando el servidor nos inica que no es nuestro turno
    $("#status").html("Nos ataca el enemigo!");//Lo mostramos al usuario
  });
  socket.on("MsgHundido",function(){//Cuando el servidor nos inica
    $("#statusT").html("Tocado y Hundido");//Lo mostramos al usuario
  });
  socket.on("MsgTocado",function(){//Cuando el servidor nos inica
    $("#statusT").html("Tocado");//Lo mostramos al usuario
  });
  socket.on("MsgAgua",function(){//Cuando el servidor nos inica
    $("#statusT").html("Agua");//Lo mostramos al usuario
  });
  socket.on("GetEnemyImgRet",function(resp){//Una vez el servidor nos responde con la imagen del enemigo
    $("#imgEn").attr("src",resp);//Le asignamos la URL a esa imagen
  });
  var chat = $("#mes");
  chat.click(function(){
    $("#messages").animate({scrollTop:$('#messages')[0].scrollHeight},0);
  });
  function createPilot(x,y,color){//Creamos la "bombilla" que indica cuando los barcos estan colocados
    var xt = parseInt(x)-13;//Le damos una X
    var yt = parseInt(y)-10;// y una Y
    board.text(xt,yt,"Listo");//Escribimos el texto que lo acompañara
    pilot = board.circle(x+5,y,8).attr({//Dibujamos el circulo
      fill:color,//Le aplicamos el color
      stroke:"black",//EL borde
      strokewidth:"1px",// y el grosor de este
    });
  }
  function createPilot2(x,y,color){//Lo mismo que la anterior pero con las cordenadas adecuadas para colocarlo en el tablero del enemigo
    var xt = parseInt(x)-20;
    var yt = parseInt(y)-10;
    board2.text(xt,yt,"Listo");
    pilotEn = board2.circle(x,y,8).attr({
      fill:color,
      stroke:"black",
      strokewidth:"1px",
    });
  }
  function createBoard(xi,yi,color){//Creamos el tablero
    var xa = xi;//Coordenadas x igualada a la que recibe para poder tener coord. originales y poder manipularlas a la vez
    var ya = yi;//Coordenadas y igualada a la que recibe para poder tener coord. originales y poder manipularlas a la vez
    for(x=0;x<9;x++){
      for(y=0;y<9;y++){
        var cel = board.rect(xa,ya,50,50).attr({//Creamos la celda y le aplicamos propiedades visuales
          fill:color,
          stroke:"#0000FF",
          strokewidth:"1px",
        });
        ArrCeldas[pos] = cel;//Agregamos la celda al array
        pos++;//Sumamos uno a la posicion
        xa=xa+50;// yi porque es 40
      }
      xa=xi;//Reinicializamos xa con xi
      ya=ya+50;//le sumamos yi a ya para bajar una fila
    }
  }
  function createBoard2(xi,yi,color){//Creamos el tablero
    pos = 0;
    var xa = xi;//Coordenadas x igualada a la que recibe para poder tener coord. originales y poder manipularlas a la vez
    var ya = yi;//Coordenadas y igualada a la que recibe para poder tener coord. originales y poder manipularlas a la vez
    for(x=0;x<9;x++){
      for(y=0;y<9;y++){
        var cel = board2.rect(xa,ya,50,50).attr({//Creamos la celda y le aplicamos propiedades visuales
          fill:color,
          stroke:"#83f33b",
          strokewidth:"1px",
        });
        ArrCeldasEn[pos] = cel;//Agregamos la celda al array
        pos++;//Sumamos uno a la posicion
        xa=xa+50;// yi porque es 40
      }
      xa=xi;//Reinicializamos xa con xi
      ya=ya+50;//le sumamos yi a ya para bajar una fila
    }
  }
}


socket.on("messages", function(data){//Cuando recibimos mensaje
  //console.log(data);
  render(data);//ejecutamos render pasandole el mensaje
});

function render(data){//Con el render de los mensajes
  var html = data.map(function(elem, index){
    return(`<div class="msg">
          <strong>${elem.author}</strong>:
          <em>${elem.text}</em>
        </div>`);//creamos la linea html que introduciremos en la div de mensajes
  }).join(" ");

  document.getElementById('messages').innerHTML = html;//la agregamos
}

function addMessage(e) {//si se añade un mensaje
  if( e[0].value == "/dev-end"){//Si este es /dev-end
    socket.emit("DEV-EndGame");//emitimos una finalizacion del juego para el developer
  }
  var payload = {
    author: document.getElementById("nombreUsr").innerHTML,
    text: document.getElementById("texto").value
  };//Indicamos cual seran los elementos que se agregaran posteriormente a la linea del mensaje

  socket.emit("new.message", payload);//Emitimos nuevo mensaje pasando payload
  document.getElementById("texto").value = "";//Vaciamos el input
  return false;//devolvemos false
}
