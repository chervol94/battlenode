'use strict';
module.exports =
class Ship{
	constructor(tipo,pos,size,IPOwn){
		this.pos = pos;
		this.tipo = tipo;
		this.damage = 0;
		this.maxDamage = size;
		this.hundido = false;
    this.IP = IPOwn;
	}
  addDamage(){
    this.damage++;
  }
  getIP(){
    return this.IPOwn;
  }
	getip(){
    return this.IPOwn;
  }
  getTipo(){
    return this.tipo;
  }
  getpos(){
    return this.pos;
  }
	checkSunk(){
		if(this.damage >= this.maxDamage){
      this.hundido = true;
      return true;
    }
    return false;
	}
};
