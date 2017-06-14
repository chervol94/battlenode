var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var routermain = require("../routes/routes.main");
var Msg = require("../model/schema").msg;
var Usr = require("../model/schema").user;
var Rnk = require("../model/schema").rank;
var Prt = require("../model/schema").partida;
var ShipsObj = require("../class/ships");
app.set("view engine","ejs");
var messages = [];//Array donde se guardan los mnsg de texto
app.use(express.static('public'));
var jugadores = [];//Array en el que se guardaran los jugadores
var nombres = []; //Array donde guardaremos los nombres de los jugadores en orden de entrada
var fotos = []; //Array donde guardaremos las fotos de cada usuario;
var sesiones = []; //Array donde guardaremos la sesion de cada usuario;
var turno = 0;//Variable que indica de quien es el turno
var nombreEn;//Nombre Enemigo
var fotoEn;//Foto enemigo
var ArrayShipsJ1 = new Array(8);//Array que contendra los objetos del jugador 1
var ArrayShipsJ2 = new Array(8);//Array que contendra los objetos del jugador 2
var fincolJ1 = 0;//Variable que indicara cuando el J1 ha finalizado la colocacion de sus barcos
var fincolJ2 = 0;//Variable que indicara cuando el J2 ha finalizado la colocacion de sus barcos
var tiroJ1 = 0;//Cantidad de tiros del J1
var tiroJ2 = 0;//Cantidad de tiros del J2


//var socket = io.connect("192.168.12.117:8080",{"forceNew":true});

//console.log(app);
app.use("/",routermain);
server.listen(8080, function(){
	console.log("Servidor corriendo en http://localhost:8080");

});
//console.log(routermain);
io.on('connection', function(socket) {//Cuando se realiza una connexion
	//console.log(socket.id);
	var address = socket.handshake;//Obtenemos la IP del cliente
	//console.log(address.address);
	console.log("Client conectado con id: "+socket.id+" y IP: "+address.address);
	if(jugadores.length<2){//Si hay espacio en jugadores
		sesiones.push(socket.id);//Introducimos la sesion en un array
		jugadores.push(address.address);//Introducimos la IP
		//console.log(jugadores.length);
		console.log("Puede jugar");
	}else{
		console.log("Limite superado");
	}
	console.log("Array de jugadores en la sesion: "+jugadores);
	console.log("Array de sesion: "+sesiones);

	socket.on("turn",function(ret){//Detectamos de quien es el turno
		var address = socket.handshake;//Obtenemos la IP del cliente
		if(jugadores[turno] == address.address){//Si el turno corresponde con la posicion de la IP
			var IPPos = jugadores.indexOf(address.address);//Obtenemos la posicion de la IP en el array
			console.log("Ha disparado:"+address.address+"a la posicion:"+ret);
			socket.emit("turnRet",ret);//Emitimos al cliente que ha realizado el disparo para que el gestione el aspecto visual del tiro
			var posbarco;//Variable que contendra la posicion del barco
			var notend = 0;//Indicara si se ha acabado el juego o no
			var hitted = 0;//Indicara si se ha hecho hit o no
			if(IPPos==0){//Si la posicion en el array es la 0, ataca el 1r jugador
				tiroJ1++;//Le sumamos un tiro a ese jugador
				for(var z = 0;z<ArrayShipsJ2.length;z++){//realizamos bucle de la longitud de el ojbeto de barcos del jugador a que hemos atacado
		      posbarco = ArrayShipsJ2[z].getpos();//Obtenemos la posicion del barco
					for(var t = 1;t<posbarco.length;t++){//Recorremos esa posicion
						//console.log(posbarco[t]+" "+ret);
						if(posbarco[t]==ret){//Si la posicion coincide con la posicion a la que se ha disparado
							hitted = 1;// Se indica tocado
							console.log("El barco "+ArrayShipsJ2[z].getTipo()+" ha sido tocado, tiros realizados:"+tiroJ1);
							ArrayShipsJ2[z].addDamage();//Se le suma daño a ese barco
							socket.emit("MsgTocado");
							var hundido = ArrayShipsJ2[z].checkSunk();//Se comprueba si se ha hundido
							console.log("Ha sido hundido? -> "+hundido);
							if(hundido == true){//Si se ha hundido
								//
								socket.emit("MsgHundido");
								//
								for(var f = 0;f<ArrayShipsJ2.length;f++){//Recorremos todo el array de objetos en busca del estado de cada barco
									if(ArrayShipsJ2[f].checkSunk() == false){//Si uno solo de esos barcos no ha sido hundido significa que la partida no ha acabado
										notend = 1;//Indicamos que la partida sigue
									}
								}
								if(notend == 0){//Si no se ha detectado ningun barco no hundido, sease, todos estan hundidos, termina el juego
									console.log("Juego finalizado");
									var UserSave = new Usr({name:nombres[IPPos],img:fotos[IPPos],Tbl_Barcos:ArrayShipsJ1});
									var RankSave = new Rnk({name:nombres[IPPos],img:fotos[IPPos],turnos:tiroJ1});
									var PartidaSave = new Prt({IPPlayerJ1:jugadores[0],nameJ1:nombres[0],imgJ1:fotos[0],turnosJ1:tiroJ1,IPPlayerJ2:jugadores[1],nameJ2:nombres[1],imgJ2:fotos[1],turnosJ2:tiroJ2});
									UserSave.save(function(err){console.log(err)});
									RankSave.save(function(err){console.log(err)});
									PartidaSave.save(function(err){console.log(err)});
									socket.emit("EndGameWin");//Emitimos a ese cliente su victoria
									io.to(sesiones[1]).emit("EndGameLose");//Y al otro cliente su derrota
								}
							}

							io.to(sesiones[1]).emit("ShipDamaged",ret);//Emitimos al cliente que ha sido atacado que en esa posicion de sus barcos se ha realizado un hit
							io.to(sesiones[1]).emit("YourTurn");//Indicamos a ese mismo cliente que ahora es su turno
							io.to(sesiones[0]).emit("NotYourTurn");//Y hacemos lo mismo con el lciente que acaba de disparar indicandole que le van a disparar
						}
					}
		    }
				if(hitted==0){//En el caso de que el barco no haya sido tocado
					console.log("Agua, tiros realizados por el jugador: "+tiroJ1);
					socket.emit("MsgAgua");
					io.to(sesiones[1]).emit("ShipNotDamaged",ret);////Emitimos al cliente que ha sido atacado que en esa posicion de sus barcos se ha realizado un tiro al agua
					io.to(sesiones[1]).emit("YourTurn");//Indicamos a ese mismo cliente que ahora es su turno
					io.to(sesiones[0]).emit("NotYourTurn");//Y hacemos lo mismo con el lciente que acaba de disparar indicandole que le van a disparar
				}
			}else{//Sino, ataca el segundo jugador, y repetimos el mismo sistema anteriormente explicado ajustado para las variables del otro jugador.
				tiroJ2++;
				for(var z = 0;z<ArrayShipsJ1.length;z++){
		      posbarco = ArrayShipsJ1[z].getpos();
					//var positionsship = posbarco.split(",");
					for(var t = 1;t<posbarco.length;t++){
						//console.log(posbarco[t]+" "+ret);
						if(posbarco[t]==ret){
							hitted = 1;
							console.log("El barco "+ArrayShipsJ1[z].getTipo()+" ha sido tocado, tiros realizados:"+tiroJ2);
							ArrayShipsJ1[z].addDamage();
							socket.emit("MsgTocado");
							var hundido = ArrayShipsJ1[z].checkSunk();
							console.log("Ha sido hundido? -> "+hundido);
							if(hundido == true){
								socket.emit("MsgHundido");
								for(var f = 0;f<ArrayShipsJ1.length;f++){
									if(ArrayShipsJ1[f].checkSunk() == false){
										notend = 1;
									}
								}
								if(notend == 0){
									console.log("Juego finalizado");
									var UserSave = new Usr({name:nombres[IPPos],img:fotos[IPPos],Tbl_Barcos:ArrayShipsJ2});
									var RankSave = new Rnk({name:nombres[IPPos],img:fotos[IPPos],turnos:tiroJ2});
									var PartidaSave = new Prt({IPPlayerJ1:jugadores[0],nameJ1:nombres[0],imgJ1:fotos[0],turnosJ1:tiroJ1,IPPlayerJ2:jugadores[1],nameJ2:nombres[1],imgJ2:fotos[1],turnosJ2:tiroJ2});
									UserSave.save(function(err){console.log(err)});
									RankSave.save(function(err){console.log(err)});
									PartidaSave.save(function(err){console.log(err)});
									socket.emit("EndGameWin");
									io.to(sesiones[0]).emit("EndGameLose");
								}
							}
							io.to(sesiones[0]).emit("ShipDamaged",ret);
							io.to(sesiones[0]).emit("YourTurn");
							io.to(sesiones[1]).emit("NotYourTurn");
						}
					}
		    }
				if(hitted==0){
					console.log("Agua, tiros realizados por el jugador: "+tiroJ2);
					socket.emit("MsgAgua");
					io.to(sesiones[0]).emit("ShipNotDamaged",ret);
					io.to(sesiones[0]).emit("YourTurn");
					io.to(sesiones[1]).emit("NotYourTurn");
				}
			}
			turno++;//Cambiamos el turno
			if(turno==2){//Si se va a salir del Array, lo inicializamos a 0 de nuevo
				turno = 0;
			}
		}else{
			console.log("No es turno de"+address.address);
		}
		//ret = adress.address;
		//io.sockets.emit("turnofin",ret);//Enviamos la respuesta del turno al cliente
	});
	socket.on("DEV-EndGame",function(){//Cuando un cliente ejecute el comando de desarrollador de finalizar juego
		var IPPos = jugadores.indexOf(address.address);//Obtenemos el indice de esa IP en el array de IP
		if(IPPos == 0){//Si es 0 guardaremos los datos del ganador, osea J1
			var UserSave = new Usr({name:nombres[IPPos],img:fotos[IPPos],Tbl_Barcos:ArrayShipsJ1});//Definimos objeto  BBDD usuario
			var RankSave = new Rnk({name:nombres[IPPos],img:fotos[IPPos],turnos:tiroJ1});//Definimos objeto ranking BBDD
			UserSave.save(function(err){console.log(err)});//lo guardamos
			RankSave.save(function(err){console.log(err)});//lo guardamos
		}else{//Sino guardaremos los del segundo jugador
			var UserSave = new Usr({name:nombres[IPPos],img:fotos[IPPos],Tbl_Barcos:ArrayShipsJ2});//Definimos objeto BBDD
			var RankSave = new Rnk({name:nombres[IPPos],img:fotos[IPPos],turnos:tiroJ2});//Definimos objeto BBDD
			UserSave.save(function(err){console.log(err)});//lo guardamos
			RankSave.save(function(err){console.log(err)});//lo guardamos
		}
		var PartidaSave = new Prt({IPPlayerJ1:jugadores[0],nameJ1:nombres[0],imgJ1:fotos[0],turnosJ1:tiroJ1,IPPlayerJ2:jugadores[1],nameJ2:nombres[1],imgJ2:fotos[1],turnosJ2:tiroJ2});//Objeto BBDD Partida
		PartidaSave.save(function(err){console.log(err)});//Guardamos
		socket.emit("EndGameWin");//Emitimos a ese cliente un final de juego victorioso
		if(IPPos == 0){//Si la Pos es 0
			io.to(sesiones[1]).emit("EndGameLose");//Respondemos al otro cliente (J1)
		}else{
			io.to(sesiones[0]).emit("EndGameLose");//respondemos al otro cliente (J2)
		}
	});
	socket.on("nombre",function(userNameFinal){//Obtenemos el nombre del UsrCliente
		//console.log(userNameFinal);
		nombres.push(userNameFinal);//Lo agregamos al array de nombres
		console.log("Array de nombres de jugadores: "+nombres);
		//io.sockets.emit("nombreret",userNameFinal);
		socket.emit("nombreret",userNameFinal);//Se lo devolvemos al cliente que lo mandó
		if(jugadores.length==2){//Si ya hay dos jugadores
			io.sockets.emit("EnemyFound");//Le enviamos al cliente el mensaje de que ya hay dos jugadores
		}
	});
	socket.on("disconnect",function(){//Detectamos una desconexion
		var ret;
		var flag = 0;//Flag que indicara si se finaliza la partida en una desconexion
		console.log("Se ha desconectado: "+address.address);
		if(address.address == jugadores[0] || address.address == jugadores[1] ){//Detectamos si la IP formaba parte de los jugadores
			console.log("Estaba en el array,eliminado");
			var IPPos = jugadores.indexOf(address.address);//Buscamos el indice de la IP
			if(jugadores[IPPos]==address.address){//Si coinciden
				jugadores.splice(IPPos,1);//La eliminamos del array de IP
				nombres.splice(IPPos,1);//Eliminamos el nombre de ese jugador en el array de nombres
				fotos.splice(IPPos,1);//Eliminamos del array de fotos, la url de la foto.
				sesiones.splice(IPPos,1);//Borramos la sesion
				ArrayShipsJ1 = new Array(8);//Objeto reinicializado
				ArrayShipsJ2 = new Array(8);//Objeto reinicializado
				tiroJ1 = 0;//Eliminamos los tiros del jugador
				tiroJ2 = 0;//Eliminamos los tiros del jugador
				fincolJ1 = 0;//Indicamos que los barcos ya no estan colocados
				fincolJ2 = 0;//Indicamos que los arcos ya no estan colocados
				flag = 1;//Indicamos que se ha eliminado
				messages = [];//Borramos los mensajes almacenados en el array de mensajes
				//;//Se reinician los turnos
			}
			if(flag==1){//Si se ha eliminado
				io.sockets.emit("gameintr", ret)//Emitimos un game interrupted a los clientes
				turno = 0;
			}
			console.log("Array de jugadores despues de eliminar: "+jugadores);
			console.log("Array de nombres despues de eliminar: "+nombres);
			console.log("Array de fotos despues de eliminar:"+fotos);
			console.log("Array de sesiones despues de eliminar:"+sesiones);
			console.log("Array de objetos J1:"+ArrayShipsJ1[0]);
			console.log("Array de objetos J2:"+ArrayShipsJ2[0]);
		}
	});
	socket.on("checkAvailable",function(reta){//Comprobamos si podemos jugar
		var IPPos = jugadores.indexOf(address.address);//Buscamos el indice de la IP del cliente que ha realizado la peticion
		if(jugadores[IPPos]==address.address){//Si la IP existe en el array
			reta = 1;//Puede jugar
		}else{
			reta = 0;//No puede jugar
		}
		socket.emit("checkAvailableRet",reta);//Le respondemos al cliente sobre la disponibilidad del juego
	});
	socket.on("GetEnemyName",function(){//Recibimos la peticion de enviar el nombre del Enemigo
		var nombreEn;//Nombre Enemigo
		var IPPosName = jugadores.indexOf(address.address);//Obtenemos el indice de la IP del cliente que ejecuta la peticion
		var IPPosNameOr = IPPosName;
		if(IPPosName == 0){//Si el cliente tiene su IP en la Pos 0 también tendrá su nombre, asi que, si su Pos es 0
			IPPosName = 1;//Selecionamos la Posicion en el array de la IP del enemigo
		}else{//Si no es 0 solo puede ser uno, asi que hacemos lo mismo a la inversa
			IPPosName = 0;//Seleccionamos la Posicion en el array de la IP del enemigo
		}
		//console.log("jugadoreslengt "+jugadores.length);
		//console.log("nombres lengt "+nombres.length);
		nombreEn = nombres[IPPosName];//Obtenemos el nombre del array en base a la posicion y lo almacenamos en una variable
		//console.log("Nombre de la IP"+address.address+"es: "+nombreEn+"en la posicion"+IPPosName);
		//console.log("Para el"+address.address+" nombre en:"+nombreEn+" pos cliente:"+IPPosNameOr+"Posicion enviada:"+IPPosName);
		socket.emit("GetEnemyNameRet",nombreEn);//Respondemos de manera individual a cada cliente enviandole a cada uno el nombre del otro jugador
	});
	socket.on("GetRanking",function(){
		var resultadosQuery = [];
		var count = 0;
		Rnk.find({},function(err,object){
			object.map(function(elem,index){
				//console.log(elem.name+" "+elem.turnos);
				var datos = [elem.img,elem.name,elem.turnos];//Definimos lo que contendra el array
				resultadosQuery[count] = datos;//Guardamos el array en otro array
				//console.log(resultadosQuery[count][0]);
				count++;//Sumamos 1
			});
			socket.emit("SendStatistics",resultadosQuery);//Enviamos los datos
		}).sort({'turnos':1});//Obtenemos los datos de Ranking ordenados ascendentemente por turnos y los guardamos en un array
	});
	socket.on("GetEnemyImg",function(){//Recibimos la peticion de enviar la foto del Enemigo
		var fotoEn;
		var IPPosImg = jugadores.indexOf(address.address);//Obtenemos el indice de la IP del cliente que ejecuta la peticion
		var IPPosImgOr = IPPosImg;
		if(IPPosImg == 0){//Si el cliente tiene su IP en la Pos 0 también tendrá su imagen asi que si su Pos es 0
			IPPosImg = 1;//Selecionamos la Posicion en el array de la IP del enemigo
		}else{//Si no es 0 solo puede ser uno, asi que hacemos lo mismo a la inversa
			IPPosImg = 0;//Seleccionamos la Posicion en el array de la IP del enemigo
		}
		fotoEn = fotos[IPPosImg];//Obtenemos la imagen del array en base a la posicion y lo almacenamos en una variable
		//console.log("Para el"+address.address+" foto en:"+fotoEn+" pos cliente:"+IPPosImgOr+" Posicion enviada:"+IPPosImg);
		socket.emit("GetEnemyImgRet",fotoEn);//Respondemos de manera individual a cada cliente enviandole a cada uno la imagen del otro jugador
	});
	socket.on("SendShips",function(ships){//cuando el cliente nos manda sus barcos
		var IPPos = jugadores.indexOf(address.address);//Averiguamos cual es su posicion ( Si J1 o J2) dependiendo de la posicione de su IP en el array
		//console.log(IPPos+" "+socket.id);
		if(IPPos == 0){//Si es el jugador 1
			var countb = 0;//Utilizamos un contador
			for(var c = 0;c<=3;c++){//Recorremos el array que nos ha pasado el cliente, el cual contiene niveles del 0 al 3
				for(var v = 0;v<ships[c].posicion.length;v++){//Por cada linea del array obtenemos la longitud de posicion y la recorremos
					ArrayShipsJ1[countb] = new ShipsObj(ships[c].tipo,ships[c].posicion[v],ships[c].size,address.address);//en este momento usamos el constructor para inicializar el objeto a la posicion que indica el contador en el Array de objetos del J1
					countb++;//Sumamos otro al contandos para guardar el siguiente
				}

			}
			fincolJ1 = 1;//Una vez finalizada la colocacion de los barcos
			io.to(sesiones[1]).emit("SendShipsRet",ships);//emitimos al otro cliente que el J1 ya ha colocado sus barcos
			console.log(ArrayShipsJ1);
		}else{//Realizamos la misma operacion que antes pero para el J2
			var countb = 0;
			for(var c = 0;c<=3;c++){
				for(var v = 0;v<ships[c].posicion.length;v++){
					ArrayShipsJ2[countb] = new ShipsObj(ships[c].tipo,ships[c].posicion[v],ships[c].size,address.address);
					countb++;
				}
			}
			fincolJ2 = 1;
			io.to(sesiones[0]).emit("SendShipsRet",ships);
			console.log(ArrayShipsJ2);
		}


	})
	socket.on("CheckStartPlay",function(){//Cuando el cliente nos emite para preguntarnos si empezamos a jugar
		if(fincolJ1 == 1 && fincolJ2 == 1){//Si ambos jugadores han almacenado sus barcos en los arrays de objetos
			io.sockets.emit("StartGame");//Emitimos a ambos cliente un inicio del juego
			io.to(sesiones[0]).emit("YourTurn");//Como sabemos que siempre empezarà a jugar el J1 le emitimos directamente para que sepa que ya puede empezar
			io.to(sesiones[1]).emit("NotYourTurn");//E indicamos que no es su turno al otro jugador.
		}
	});
	socket.on("generateImg",function(url){//Generamos la imagen del usuario
		var num = Math.floor(Math.random() * 5) + 1;//Realizamos un random
		url = "/images/d"+num+".jpg";//añadimos ese random a la url para obtener el nobre i la url
		fotos.push(url);//agregamos la url al array de fotos
		console.log("Array de Fotos"+fotos);//Mostramos como està el array de fotos
		socket.emit("generateImgRet",url);//Emitimos la respuesta al cliente que la solicitó. mandando su foto
	});
	socket.emit("messages", messages);
	socket.on('new.message', function(data){
		messages.push(data);
		//console.log(messages);
		socket.emit("messages", messages);
		//var address = socket.handshake;
		//if(arrayips[turno] == address.address){ messages.push(data);
		//var mensaje = new Msg({autor:socket.id, texto:data.text});
		//mensaje.save(function(err){ console.log(err); });
		io.sockets.emit("messages", messages);

	});
	/*socket.emit("messages", messages);

	socket.on('new.message', function(data){
		messages.push(data);

		io.sockets.emit("messages", messages);
	});*/
});
