'use strict';

let app = null;
// Variável que define se o slider está ou não aberto
let secondCanvasActive = false;

// Função que move o slider com o segundo canvas e outras opções
function moveChoiceCanvas(){
    secondCanvasActive = !secondCanvasActive;
    if (secondCanvasActive){
        document.getElementById("right-slider").style.transform = "translate(-290px)"; // Fazendo uma translação
        document.getElementById("right-slider-btn").style.transform = "translate(-290px)";
    }
    else {
        document.getElementById("right-slider").style.transform = "translate(0px)";
        document.getElementById("right-slider-btn").style.transform = "translate(0px)";
    }
}

function main() {
    // Obtenção dos 2 canvas
    let cnv = document.getElementById('canvas');
    let cnv2 = document.getElementById('choicecanvas');

    // Desenho do retângulo preto à volta para definir àrea do canvas
    drawCanvasRect(cnv);
    drawCanvasRect(cnv2);

    app = new FotoPrint();
  //  app.init();
    app.drawObj(cnv);
    cnv.addEventListener('mousedown', drag, false);       // arrastar com o rato premido;
    cnv.addEventListener('click', showOptions, false);    // mostrar opções (delete, repaint, scale) com clique;
    cnv.addEventListener('dblclick', makenewitem, false); // duplicar ou colocar item selecionado com duplo clique;
    cnv2.addEventListener('click', selectitem, false)     // selecionar item do segundo canvas com clique;
    app.drawObjsel();
}

// Função que mostra as 3 opções de edição caso esteja selecionada uma figura (ou seja, o return de selectMainObj for true)
function showOptions(ev){
    let mx = null;
    let my = null;
    let cnv = document.getElementById('canvas');

    let xPos = 0;
    let yPos = 0;
    [xPos, yPos] = getMouseCoord(cnv);
    mx = ev.x - xPos;
    my = ev.y - yPos;

    if (app.selectMainObj(mx, my)) {
        document.getElementById("editoptions").style.display = 'block';
        // O slider de escala fica com o valor da escala do objeto selecionado
        document.getElementById("myRange").value = app.editableItem.scale * 10; 
    } else {
        document.getElementById("editoptions").style.display = 'none';
    }
}

function drawCanvasRect(cnv) {
    let ctx = cnv.getContext("2d");
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cnv.width, cnv.height);
}

//Drag & Drop operation
//drag
function drag(ev) {
    let mx = null;
    let my = null;
    let cnv = document.getElementById('canvas');

    let xPos = 0;
    let yPos = 0;
    [xPos, yPos] = getMouseCoord(cnv);
    mx = ev.x - xPos;
    my = ev.y - yPos;

    if (app.dragObj(mx, my)) {
        cnv.style.cursor = "pointer";
        cnv.addEventListener('mousemove', move, false);
        cnv.addEventListener('mouseup', drop, false);
    }

}

//Drag & Drop operation
//move
function move(ev) {
    let mx = null;
    let my = null;
    let cnv = document.getElementById('canvas');

    let xPos = 0;
    let yPos = 0;
    [xPos, yPos] = getMouseCoord(cnv);
    mx = ev.x - xPos;
    my = ev.y - yPos;

    app.moveObj(mx, my);
    drawCanvasRect(cnv);
    app.drawObj(cnv);
}

//Drag & Drop operation
//drop
function drop() {
    let cnv = document.getElementById('canvas');
    
    cnv.removeEventListener('mousemove', move, false);
    cnv.removeEventListener('mouseup', drop, false);
    cnv.style.cursor = "crosshair";
}

//Insert a new Object on Canvas
//dblclick Event
function makenewitem(ev) {
    let mx = null;
    let my = null;
    let cnv = document.getElementById('canvas');
    
    let xPos = 0;
    let yPos = 0;
    [xPos, yPos] = getMouseCoord(cnv);
    console.log(xPos)
    mx = ev.x - xPos;
    my = ev.y - yPos;

    if (app.insertObj(mx, my)) {
        drawCanvasRect(cnv);
        app.drawObj(cnv);
    }
}

// Função que atualiza a escala do objeto selecionado
function resizeObject(rangeValue){
    let cnv = document.getElementById('canvas');
    app.changeObjectSize(rangeValue); // chamando a funçao de fotoprint.js
    // E atualizando o canvas
    drawCanvasRect(cnv);
    app.drawObj(cnv);
}

//Select an item from the Second Canvas
//click Event
function selectitem(ev) {
    let mx = null;
    let my = null;
    let cnv2 = document.getElementById('choicecanvas');

    let xPos = 0;
    let yPos = 0;
    [xPos, yPos] = getMouseCoord(cnv2);
    mx = ev.x - xPos;
    my = ev.y - yPos;
    drawCanvasRect(cnv2);
    if (app.selectObj(mx, my)) {
        app.drawObjsel();
    }
}

//Delete button
//Onclick Event
function remove() {
    let cnv = document.getElementById('canvas');
    app.removeObj();
    drawCanvasRect(cnv);
    app.drawObj(cnv);
}

//Save button
//Onclick Event
// Função dada pelo professor nas "Linhas Orientadoras Parte 2"
function saveasimage() {
    
        let link = document.createElement('a');
        link.download = "fotoprintTP4.png";
        
        let cnv = document.getElementById("canvas");
        let background = new Rect(2, 2, cnv.width-5, cnv.height-5, app.backgroundColor, 1);
        drawCanvasRect(cnv);
        background.draw(cnv);
        app.drawObj(cnv);

        link.href = cnv.toDataURL("image/png").replace("image/png", "image/octet- stream");
        link.click();
    }

//Reset button
//Onclick Event
// Limpa todo o canvas e reinicia todas as variáveis e cliques
function reset(){
    let cnv = document.getElementById('canvas');
    cnv.style.backgroundColor = "ghostwhite";
    let cnv2 = document.getElementById('choicecanvas');
    drawCanvasRect(cnv);
    drawCanvasRect(cnv2);
    app = new FotoPrint();
  //  app.init();
    app.drawObj(cnv);
    cnv.addEventListener('mousedown', drag, false);
    cnv.addEventListener('dblclick', makenewitem, false);
    cnv.addEventListener('click', showOptions, false);
    cnv2.addEventListener('click', selectitem, false);
    document.getElementById("editoptions").style.display = 'none';
    app.drawObjsel();
}


//Mouse Coordinates for all browsers
function getMouseCoord(el) {
    let xPos = 0;
    let yPos = 0;

    while (el) {
        if (el.tagName === "BODY") {
            // deal with browser quirks with body/window/document and page scroll
            let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            let yScroll = el.scrollTop || document.documentElement.scrollTop;

            xPos += (el.offsetLeft - xScroll + el.clientLeft);
            yPos += (el.offsetTop - yScroll + el.clientTop);
        } else {
            // for all other non-BODY elements
            xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
        }

        el = el.offsetParent;
    }
    return [xPos,yPos];
}

//Add Text to Canvas
function insertText(){
    let cnv   = document.getElementById("canvas");
    let ctx   = cnv.getContext("2d");
    // Prompt abre no topo do ecrã uma janela que permite a escrita do texto pretendido, que fica armazenado em text
    let text  = prompt("Insert text here");
    if (text === null) return; // Se for nulo, ignora-se
    // Se não, mede-se o texto e instancia-se
    let width = ctx.measureText(text).width;
    let addedText = new Text(text, 50, 50, 30, width, app.objectColor, 1);
    // Adicionando ao canvas
    app.shpinDrawing.insert(addedText);
    // E atualizando-o
    app.drawObj(cnv);
}

//Add Image to Canvas
function insertImage(){
    // Obtenção do elemento que abre o navegador de ficheiros
    let fileInput = document.getElementById('inserirImagem');
    // Obtenção do ficheiro selecionado
    let fileUrl = window.URL.createObjectURL(fileInput.files[0]);
    let cnv = document.getElementById("canvas");
    // Inicialização da imagem
    let imgobj = new Image();
    // Obtenção da source da mesma
    imgobj.src = fileUrl;
    // Criação da instância da imagem
    let imagem = new Picture(50, 50, 192, 108, fileUrl, 1);
    // E inserção no canvas
    app.shpinDrawing.insert(imagem);
    // Fazendo a sua atualização
    app.drawObj(cnv);
}