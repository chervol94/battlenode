var socket = io.connect("192.168.12.138:8080",{"forceNew":true});

function representData(data){
  //alert(data.length);
  var htmlf="";//Inicializamos var que contendrà la linea que sera añadida
  var bck_col = "";// Variable que contendra el color de fondo
  if(data.length>10){//Si el length de los datos es mayor que 10
    var max = 9;//Igualar a 9 ya que solo queremos los 10 primeros
  }else{//Sino
    var max = data.length-1;//Igualarlo a su longitud-1
  }

  for(x=0;x<=max;x++){//Bucle para recorrer el array con los datos hasta la cantidad
    //alert(data[x][0]);
      if(x==0){bck_col = "p"}//Si el primero indicamos el estilo sera p de primero (gold)
      if(x==1){bck_col = "s"}//Si el segundo indicamos el estilo sera s de segundo (silver)
      if(x==2){bck_col = "t"}//Si el tercero indicamos el estilo sera t de tercero (bronze)
      else if(x>2){bck_col = ""}//Sino, no tendra, lo que lo hará blanco
      var html ="<div class='Rank "+bck_col+"'><p class='num_rnk'><strong>"+(x+1)+"º</strong></p><img class='imgusr' alt='Imagen' src="+data[x][0]+"></img> <p class='nme_usr'>"+data[x][1]+"</p><div class='pnts'>Tiros<p class='pnts_n'>"+data[x][2]+"</p></div></div>";
      htmlf += html;//Añadimos la linea



  }
  document.getElementById('resultados').innerHTML = htmlf;//La mostramos
}

window.onload = function(){//Al cargar
  socket.emit("GetRanking");//Emitimos obtener ranking
  socket.on("SendStatistics",function(data){//Cuando el server emita las estadisticas
    representData(data);//las pasamos a la funcion
  });
}
