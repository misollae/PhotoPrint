'use strict';

class FotoPrint
{
    constructor() {
        this.editableItem  = null; // Item selecionado no canvas principal
        this.thingInMotion = null; // Item em movimento no canvas principal
        this.selectedObj   = null; // Item escolhido no canvas secundário

        // Auxiliares
        this.offsetx = null; 
        this.offsety = null;

        // Cores iniciais de fundo e objetos do canvas secundário
        this.backgroundColor = "ghostwhite";
        this.objectColor = "#FFC0CB";
        
        // Array auxiliar com os objetos das duas colunas do segundo canvas, 
        // a ser atualizado, que facilitará a obtenção do objeto selecionado
        this.objectsCol1 = [Rect, Triangle, Ghost, Bow];
        this.objectsCol2 = [Oval, Heart, Bear, Gingerbread]

        // Limites dos canvas
        this.shpinDrawing  = new Pool(100);
        this.shpinDrawing2 = new Pool(100);
    }

    // Atualização da cor de fundo
    changeBackgroundColor(color){
        this.backgroundColor = color;
        let cnv = document.getElementById("canvas");
        // mudando o style no documento
        cnv.style.backgroundColor = this.backgroundColor;
    }

    // Atualização da cor dos objetos no canvas secundário
    changeObjectColor(color) {
        this.objectColor = color;
        // e atualização da instância que se encontra selecionada, caso algum objeto o esteja
        // de forma a que ao colocar no canvas principal não fique com a com anterior
        if (this.selectedObj !== null) this.selectedObj.changeColor(color);
        this.drawObjsel();
    }

    // Atualização da escala do objeto selecionado no canvas principal
    changeObjectSize(rangeValue){
        let scale = rangeValue/10; // conversão da escala para decimais (intervalo [0,1 ; 4])
        this.editableItem.changeScale(scale);
    }

    // Atualização da cor do objeto selecionado no canvas principal
    updateObjectColor() {
        let cnv = document.getElementById("canvas");   
        this.editableItem.changeColor(this.objectColor);     
        this.drawObj(cnv);
        this.dragObj(this.editableItem.posx, this.editableItem.posy)
    }

    drawObj(cnv) {
        for (let i = 0; i < this.shpinDrawing.stuff.length; i++) {
            this.shpinDrawing.stuff[i].draw(cnv);
        }
    }

    dragObj(mx, my) {
        let endpt = this.shpinDrawing.stuff.length-1;
        for (let i = endpt; i >= 0; i--) {
            if (this.shpinDrawing.stuff[i].mouseOver(mx, my)) {
                this.offsetx = mx - this.shpinDrawing.stuff[i].posx;
                this.offsety = my - this.shpinDrawing.stuff[i].posy;
                let item = this.shpinDrawing.stuff[i];
                this.thingInMotion = this.shpinDrawing.stuff.length - 1;
                this.shpinDrawing.stuff.splice(i, 1);
                this.shpinDrawing.stuff.push(item);
                return true;
            }
        }
        return false;
    }

    moveObj(mx, my) {
        this.shpinDrawing.stuff[this.thingInMotion].setPos(mx - this.offsetx, my - this.offsety)
    }

    removeObj () {
        if (this.shpinDrawing.stuff.length != 0) this.shpinDrawing.remove();
        document.getElementById("editoptions").style.display = 'none';
    }

    selectMainObj(mx, my){
        let endpt = this.shpinDrawing.stuff.length-1;
        for (let i = endpt; i >= 0; i--) {
            if (this.shpinDrawing.stuff[i].mouseOver(mx, my)) {
                this.editableItem = this.shpinDrawing.stuff[i];
                return true;
            }
        }
        return false;
    }

    // Seleção de um objeto do canvas secundário
    selectObj(mx, my){
        let canvasSelecao = document.getElementById('choicecanvas');
        // Obtenção da largura e altura do canvas
        let canvasWidth  = canvasSelecao.getBoundingClientRect().width;
        let canvasHeight = canvasSelecao.getBoundingClientRect().height;
        // E do tamanho da "caixa" que envolve cada objeto, igual para todos,
        // dividindo a altura pelo número de objetos na coluna e a largura pelo número de 
        // objetos na linha
        let objectWidth  = canvasWidth/2;
        let objectHeight = canvasHeight/4;

        let coluna; 
        // Vemos quantas caixas "cabem" em altura desde o inicio do canvas até ao clique do rato, assim
        // descobre-se em qual das caixas for feito o clique na vertical
        let linha = Math.floor(my/(canvasHeight/4));

        if (mx + 290 < 0 || mx + 290 > canvasWidth || my < 0 || my > canvasHeight) return false;

        // Faz-se o mesmo tipo de contas para as linhas, descobrindo o índice da caixa onde se clica e indo
        // buscar o objeto ao array da coluna correspondente que contém os objetos do canvas secundário
        if ((mx + 290) < canvasWidth/2) {this.selectedObj = this.objectsCol1[linha]; coluna = 0;}
        if ((mx + 290) > canvasWidth/2) {this.selectedObj = this.objectsCol2[linha]; coluna = 1;}

        // Desenho de um retângulo cinza atrás do objeto selecionado
        let backRect = new Rect(objectWidth * coluna + 1, objectHeight * linha + 1, objectWidth - 2, objectHeight - 2, "Gainsboro", 1);
        backRect.draw(canvasSelecao);
        return true;
    }

    // Método que desenha todos os objetos no canvas secundário
    drawObjsel(){
        let canvasSelecao = document.getElementById('choicecanvas');
        // Obtenção da largura e altura do canvas
        let canvasWidth  = canvasSelecao.getBoundingClientRect().width;
        let canvasHeight = canvasSelecao.getBoundingClientRect().height;
        // E do tamanho da "caixa" que envolve cada objeto, igual para todos,
        // dividindo a altura pelo número de objetos na coluna e a largura pelo número de 
        // objetos na linha
        let objectWidth  = canvasWidth/2;
        let objectHeight = canvasHeight/4;
        
        // Desenho de todos os objetos, linha a linha
        let r = new Rect(objectWidth / 4, objectHeight/4.5, 60, 60, this.objectColor, 1);
        let o = new Oval(objectWidth + objectWidth/2, objectHeight/4.5 + 30, 30, 1, 1, this.objectColor, 1);
        r.draw(canvasSelecao);
        o.draw(canvasSelecao);

        let t = new Triangle(objectWidth / 4, objectHeight/4.5 + objectHeight, 60, 60, this.objectColor, 1);
        let h = new Heart(objectWidth + objectWidth/2, objectHeight + 2.5*objectHeight/8 + 2, 70, this.objectColor, 1);
        h.draw(canvasSelecao);
        t.draw(canvasSelecao);
        
        let g = new Ghost(objectWidth/2, objectHeight*2 + 50, 80, this.objectColor, 1);
        let b = new Bear(objectWidth + objectWidth/2, objectHeight*2 + objectHeight/1.8, 32, this.objectColor, 1);
        b.draw(canvasSelecao);
        g.draw(canvasSelecao);

        let bow = new Bow(objectWidth/2, objectHeight*3 + objectHeight/2, 35, this.objectColor, 1);
        let ginger = new Gingerbread(objectWidth + objectWidth/2, objectHeight*3 + objectHeight/4, 45, this.objectColor, 1);
        bow.draw(canvasSelecao);
        ginger.draw(canvasSelecao);

        // Atualização dos arrays com as instâncias dos objetos por colunas
        this.objectsCol1 = [r, t, g, bow];
        this.objectsCol2 = [o, h, b, ginger];
    }
    
    insertObj (mx, my) {
        let item = null;
        let endpt = this.shpinDrawing.stuff.length-1;
        
        for (let i = endpt; i >= 0; i--) {
            console.log(this.shpinDrawing.stuff[i]);
            if (this.shpinDrawing.stuff[i].mouseOver(mx,my)) {
                item = this.cloneObj(this.shpinDrawing.stuff[i]);
                this.shpinDrawing.insert(item);
                return true;
            }
        }

        if (this.selectedObj !== null) {
            item = this.cloneObj(this.selectedObj);
            item.setPos(mx, my);
            this.shpinDrawing.insert(item);
            this.editableItem = item;
            // Quando há um objeto selecionado no canvas principal, mostram-se as opções de edição no canto inferior direito
            document.getElementById("editoptions").style.display = 'block';
            document.getElementById("myRange").value = app.editableItem.scale * 10;
            return true;
        }
        return false;
    }
    
    cloneObj (obj) {
        let item = {};

        switch(obj.name) {
            case "R":
                item = new Rect(obj.posx + 20, obj.posy + 20, obj.w, obj.h, obj.color, obj.scale);
                break;

            case "P":
                item = new Picture(obj.posx + 20, obj.posy + 20, obj.w, obj.h, obj.impath, obj.scale);
                break;

            case "O":
                item = new Oval(obj.posx + 20, obj.posy + 20, obj.r, obj.hor, obj.ver, obj.color, obj.scale);
                break;

            case "H":
                item = new Heart(obj.posx + 20, obj.posy + 20, obj.drx * 4, obj.color, obj.scale);
                break;

            case "B":
                item = new Bear(obj.posx + 20, obj.posy + 20, obj.radius, obj.color, obj.scale);
                item.setPos(obj.posx + 20, obj.posy + 20);
                break;

            case "T":
                item = new Triangle(obj.posx + 20, obj.posy + 20, obj.height, obj.base, obj.color, obj.scale);
                break;

            case "G":
                item = new Ghost(obj.posx + 20, obj.posy + 20, obj.width, obj.color, obj.scale);
                item.setPos(obj.posx + 20, obj.posy + 20);
                break;

            case "Ginger":
                item = new Gingerbread(obj.posx + 20, obj.posy + 20, obj.height, obj.color, obj.scale);
                item.setPos(obj.posx + 20, obj.posy + 20);
                break;

            case "Bow":
                item = new Bow(obj.posx + 20, obj.posy + 20, obj.length, obj.color, obj.scale);
                break;

            case "Text":
                item = new Text(obj.text, obj.posx + 20, obj.posy + 20, obj.height, obj.width, obj.color, obj.scale);
                break;

            default: throw new TypeError("Can not clone this type of object");
        }
        return item;
    }

    // Auxiliar de testes
    init() {
        let h = new Heart(-50, 170, 80, "ghostwhite", 1);
        this.shpinDrawing.insert(h);
    }

}

class Pool
{
    constructor (maxSize) {
        this.size = maxSize;
        this.stuff = [];
    }

    insert (obj) {
        if (this.stuff.length < this.size) {
            this.stuff.push(obj);
        } else {
            alert("The application is full: there isn't more memory space to include objects");
        }
    }

    remove () {
        if (this.stuff.length !== 0) {
            this.stuff.pop();
        } else {
           alert("There aren't objects in the application to delete");
        }
    }
}