class DrawingObjects
{
    constructor (px, py, name) {
        if (this.constructor === DrawingObjects) {
            // Error Type 1. Abstract class can not be constructed.
            throw new TypeError("Can not construct abstract class.");
        }

        //else (called from child)
        // Check if all instance methods are implemented.
        if (this.draw === DrawingObjects.prototype.draw) {
            // Error Type 4. Child has not implemented this abstract method.
            throw new TypeError("Please implement abstract method draw.");
        }

        if (this.mouseOver === DrawingObjects.prototype.mouseOver) {
            // Error Type 4. Child has not implemented this abstract method.
            throw new TypeError("Please implement abstract method mouseOver.");
        }

        this.posx = px;
        this.posy = py;
        this.name = name;
    }

    // Chamado quando se atualiza a cor, recebendo a nova e substituindo o atributo
    changeColor(color){
        this.color = color;
    }

    // Chamado quando se atualiza a escala, recebendo a nova e substituindo o atributo
    changeScale(scale){
        this.scale = scale;
    }

    draw (cnv) {
        // Error Type 6. The child has implemented this method but also called `super.foo()`.
        throw new TypeError("Do not call abstract method draw from child.");
    }

    mouseOver(mx, my) {
        // Error Type 6. The child has implemented this method but also called `super.foo()`.
        throw new TypeError("Do not call abstract method mouseOver from child.");
    }

    // Usado para atualizar posição
    setPos(x, y){
        this.posx = x;
        this.posy = y;
    }

    sqDist(px1, py1, px2, py2) {
        let xd = px1 - px2;
        let yd = py1 - py2;

        return ((xd * xd) + (yd * yd));
    }
}

class Rect extends DrawingObjects
{

    constructor (px, py, w, h, c, scale) {
        super(px, py, 'R');
        this.w = w;
        this.h = h;
        this.color = c;
        this.scale = scale;
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posx, this.posy, this.w * this.scale, this.h * this.scale);
    }

    mouseOver(mx, my) {
        return ((mx >= this.posx) && (mx <= (this.posx + (this.w * this.scale))) && (my >= this.posy) && (my <= (this.posy + (this.h * this.scale))));
    }
}

class Picture extends DrawingObjects
{

    constructor (px, py, w, h, impath, scale) {
        super(px, py, 'P');
        this.w = w;
        this.h = h;
        this.impath = impath;
        this.imgobj = new Image();
        this.imgobj.src = this.impath;
        this.imgobj.onload = function() {
            h = (w * this.naturalHeight) / this.naturalWidth;  
            self.h = h;
            console.log(self.h)
        }
        this.scale = scale;
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");

        if (this.imgobj.complete) {
            ctx.drawImage(this.imgobj, this.posx, this.posy, this.w * this.scale, this.h * this.scale);
            console.log("Debug: N Time");

        } else {
            console.log("Debug: First Time");
            let self = this;
            // naturalHeight e naturalWidth são as proporções em pixeis verdadeiras da imagem; faz-se uma
            // regra de 3 simples para manter as proporções quando se adiciona a imagem, tomando como base
            // a largura dada e adaptando a altura.
            this.imgobj.addEventListener('load', function () {
                self.h = (self.w * this.naturalHeight) / this.naturalWidth;  
                ctx.drawImage(self.imgobj, self.posx, self.posy, self.w, self.h);
            }, false);
        }
    }

    mouseOver(mx, my) {
        return ((mx >= this.posx) && (mx <= (this.posx + this.w * this.scale)) && (my >= this.posy) && (my <= (this.posy + this.h * this.scale)));
    }
}

class Triangle extends DrawingObjects{
    constructor (posx, posy, height, base, c, scale) {
        super(posx, posy, "T")
        this.height = height;
        this.base = base;
        this.color = c;
        this.scale = scale;
    }

    // Dado os 3 pontos do triângulo calcula a área
    area(px1, py1, px2, py2, px3, py3){
        return Math.abs((px1*(py2-py3) + px2*(py3-py1)+ px3*(py1-py2))/2.0);
    }

    // Vê a soma da área dos 3 triângulos que usam cada 2 dos vértices do principal e o ponto onde o rato clicou e a área
    // total (AT) do triângulo
    mouseOver (mx, my) {
        let AT = this.area(this.posx, this.posy, this.posx, this.posy + (this.height * this.scale), this.posx + (this.base * this.scale), this.posy);
        let A1 = this.area(mx, my, this.posx, this.posy + (this.height * this.scale), this.posx + (this.base * this.scale), this.posy);
        let A2 = this.area(this.posx, this.posy, mx, my, this.posx + (this.base * this.scale), this.posy);
        let A3 = this.area(this.posx, this.posy, this.posx, this.posy + (this.height * this.scale), mx, my);

        return (AT + 0.1 >= A1 + A2 + A3 && AT - 0.1 <= A1 + A2 + A3);
    }

    setPos(x, y){
        super.setPos(x, y);
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.lineTo(this.posx, this.posy + (this.height * this.scale));
        ctx.lineTo(this.posx + (this.base * this.scale), this.posy);
        ctx.closePath();
        ctx.fill();
    }
}

class Oval extends DrawingObjects
{
    constructor (px, py, r, hs, vs, c, scale) {
        super(px, py, 'O');
        this.r = r;
        this.radsq = r * r;
        this.hor = hs;
        this.ver = vs;
        this.color = c;
        this.scale = scale;
    }

    mouseOver (mx, my) {
        let x1 = 0;
        let y1 = 0;
        let x2 = (mx - this.posx) / (this.hor);
        let y2 = (my - this.posy) / (this.ver);

        return (this.sqDist(x1,y1,x2,y2) <= (this.radsq * this.scale * this.scale));
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");

        ctx.save();
        ctx.translate(this.posx,this.posy);
        ctx.scale(this.hor,this.ver);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.r * this.scale, 0, 2*Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}


class Heart extends DrawingObjects
{
    constructor (px, py, w, c, scale) {
        super(px, py, 'H');
        this.h = w * 0.7;
        this.drx = w / 4;
        this.radsq = this.drx * this.drx;
        this.ang = .25 * Math.PI;
        this.color = c;
        this.scale = scale;
    }

    outside (x, y, w, h, mx, my) {
        return ((mx < x) || (mx > (x + w)) || (my < y) || (my > (y + h)));
    }

    draw (cnv) {
        let leftctrx = this.posx - (this.drx * this.scale);
        let rightctrx = this.posx + (this.drx * this.scale);
        let cx = rightctrx + (this.drx * this.scale) * Math.cos(this.ang);
        let cy = this.posy + (this.drx * this.scale) * Math.sin(this.ang);
        let ctx = cnv.getContext("2d");

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.arc(leftctrx, this.posy, (this.drx * this.scale), 0, Math.PI - this.ang, true);
        ctx.lineTo(this.posx, this.posy + (this.h * this.scale));
        ctx.lineTo(cx,cy);
        ctx.arc(rightctrx, this.posy, (this.drx * this.scale), this.ang, Math.PI, true);
        ctx.closePath();
        ctx.fill();
    }

    mouseOver (mx, my) {
        let leftctrx = this.posx - (this.drx * this.scale);
        let rightctrx = this.posx + (this.drx * this.scale);
        let qx = this.posx - 2 * (this.drx * this.scale);
        let qy = this.posy - (this.drx * this.scale);
        let qwidth = 4 * (this.drx * this.scale);
        let qheight = (this.drx * this.scale) + (this.h * this.scale);

        let x2 = this.posx;
        let y2 = this.posy + (this.h * this.scale);
        let m = (this.h * this.scale) / (2 * (this.drx * this.scale));

        //quick test if it is in bounding rectangle
        if (this.outside(qx, qy, qwidth, qheight, mx, my)) {
            return false;
        }

        //compare to two centers
        if (this.sqDist (mx, my, leftctrx, this.posy) < (this.radsq * this.scale * this.scale)) return true;
        if (this.sqDist(mx, my, rightctrx, this.posy) < (this.radsq * this.scale * this.scale)) return true;

        // if outside of circles AND less than equal to y, return false
        if (my <= this.posy) return false;

        // compare to each slope
        // left side
        if (mx <= this.posx) {
            return (my < (m * (mx - x2) + y2));
        } else {  //right side
            m = -m;
            return (my < (m * (mx - x2) + y2));
        }
    }
}

class Bear extends DrawingObjects
{
    constructor (px, py, r, c, scale) {
        super(px, py, 'B');
        this.radius = r;
        this.color = c;
        this.scale = scale;

         // orelhas
         this.orelhaEsquerda = new Oval(this.posx - this.radius/1.2, this.posy - this.radius/1.4, this.radius/2, 1.1, 1, this.color, this.scale);
         this.orelhaEsquerdaCentro = new Oval(this.posx - this.radius/1.2, this.posy - this.radius/1.4, this.radius/4.2, 1.1, 1, "black", this.scale);
         this.orelhaDireita = new Oval(this.posx + this.radius/1.2, this.posy - this.radius/1.4, this.radius/2, 1.1, 1, this.color, this.scale);
         this.orelhaDireitaCentro = new Oval(this.posx + this.radius/1.2, this.posy - this.radius/1.4, this.radius/4.2, 1.1, 1, "black", this.scale);
         // centro/cara
         this.cara = new Oval(this.posx, this.posy, this.radius, 1.1, 1, this.color, this.scale);
         this.olhoEsquerdo = new Oval(this.posx - this.radius/2.5, this.posy - this.radius/4.85, this.radius/7.14, 1, 1, "black", this.scale);
         this.olhoEsquerdoBrilho = new Oval(this.posx - this.radius/2.08, this.posy - this.radius/3.94, this.radius/25, 1, 1, "white", this.scale);
         this.olhoDireito = new Oval(this.posx + this.radius/2.5, this.posy - this.radius/4.85, this.radius/7.14, 1, 1, "black", this.scale);
         this.olhoDireitoBrilho = new Oval(this.posx + this.radius/3.125, this.posy - this.radius/3.94, this.radius/25, 1, 1, "white", this.scale);
         this.nariz = new Oval(this.posx, this.posy + this.radius/10, this.radius/5, 1.5, 1.15, "black", this.scale);
         this.narizBrilho = new Oval(this.posx - this.radius/6.25, this.posy + 1, this.radius/18, 1, 1, "white", this.scale);
    }

    mouseOver (mx, my) {
        // No mouseOver basta ter clicado numa das orelhas ou na cara, chamando o método da oval correspondente
        return (this.orelhaEsquerda.mouseOver(mx, my) || this.cara.mouseOver(mx, my) || this.orelhaDireita.mouseOver(mx, my));
    } 

    // Chama o método change color das ovais que devem mudar de cor (orelhas e cara)
    changeColor(color){
         super.changeColor(color);
         // orelhas
         this.orelhaEsquerda.changeColor(color);
         this.orelhaDireita.changeColor(color);
         // centro/cara
         this.cara.changeColor(color);
        }

    // Atualiza a posição de todas as componentes, mantendo a proporção
    setPos(x, y){
        this.orelhaEsquerda.setPos(x - (this.radius * this.scale)/1.2, y - (this.radius * this.scale)/1.4);
        this.orelhaEsquerdaCentro.setPos(x - (this.radius * this.scale)/1.2, y - (this.radius * this.scale)/1.4);
        this.orelhaDireita.setPos(x + (this.radius * this.scale)/1.2, y - (this.radius * this.scale)/1.4);
        this.orelhaDireitaCentro.setPos(x + (this.radius * this.scale)/1.2, y - (this.radius * this.scale)/1.4);
        this.cara.setPos(x, y);
        this.olhoEsquerdo.setPos(x - (this.radius * this.scale)/2.5, y - (this.radius * this.scale)/4.85);
        this.olhoEsquerdoBrilho.setPos(x - (this.radius * this.scale)/2.08, y - (this.radius * this.scale)/3.94);
        this.olhoDireito.setPos(x + (this.radius * this.scale)/2.5, y - (this.radius * this.scale)/4.85);
        this.olhoDireitoBrilho.setPos(x + (this.radius * this.scale)/3.125, y - (this.radius * this.scale)/3.94);
        this.nariz.setPos(x, y + (this.radius * this.scale)/10);
        this.narizBrilho.setPos(x - (this.radius * this.scale)/6.25, y + 1);
        super.setPos(x, y);
    }

    // Atualiza a escala de todas as componentes, mantendo a proporção
    changeScale(newScale){
        super.changeScale(newScale);
        this.orelhaEsquerda.changeScale(newScale);
        this.orelhaEsquerdaCentro.changeScale(newScale);
        this.orelhaDireita.changeScale(newScale);
        this.orelhaDireitaCentro.changeScale(newScale);
        this.cara.changeScale(newScale);
        this.olhoEsquerdo.changeScale(newScale);
        this.olhoEsquerdoBrilho.changeScale(newScale);
        this.olhoDireito.changeScale(newScale);
        this.olhoDireitoBrilho.changeScale(newScale);
        this.nariz.changeScale(newScale);
        this.narizBrilho.changeScale(newScale);
        this.setPos(this.posx, this.posy);
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");

        this.orelhaEsquerda.draw(cnv);
        this.orelhaEsquerdaCentro.draw(cnv);
        this.orelhaDireita.draw(cnv);
        this.orelhaDireitaCentro.draw(cnv);
        this.cara.draw(cnv);
        this.olhoEsquerdo.draw(cnv);
        this.olhoEsquerdoBrilho.draw(cnv);
        this.olhoDireito.draw(cnv);
        this.olhoDireitoBrilho.draw(cnv);
        this.nariz.draw(cnv);
        this.narizBrilho.draw(cnv);

        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";

        // Boca
        ctx.beginPath();
        ctx.arc(this.posx + (this.radius*this.scale)/4.5, this.posy + (this.radius*this.scale)/4.5, (this.radius*this.scale) / 4, 0, Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.posx - (this.radius*this.scale)/4.5, this.posy + (this.radius*this.scale)/4.5, (this.radius*this.scale) / 4, 0, Math.PI, false);
        ctx.stroke();
    }
}

class Bow extends DrawingObjects
{
    constructor (px, py, l, c, scale) {
        super(px, py, 'Bow');
        this.length = l;
        this.color = c;
        this.scale = scale;

        this.bow = new Oval(this.posx, this.posy, this.length/9.5, 1, 1, this.color, this.scale);
    }

    mouseOver (mx, my) {
        // Obtenção das coordenadas dos centros (c1 e c2, que têm o mesmo valor y) e dos valores a/b de elipses
        // que vão auxiliar a parameterização do clique (duas elipses verticais nas pontas do laço)
        let c1x = this.posx - (this.length * this.scale)/1.4;
        let c2x = this.posx + (this.length * this.scale)/1.4;
        let cy  = this.posy - (this.length * this.scale)/15;
        let a   = ((this.length * this.scale)/2.2);
        let b   = ((this.length * this.scale)/2.2) * 0.6;

        // Aplicação da fórmula do interior de uma elipse
        let x1 = Math.abs(mx - c1x);
        let x2 = Math.abs(mx - c2x);
        let y = Math.abs(my - cy);
        let mouseOverLeftBow  = (((((x1*x1)/(b*b)) + ((y*y)/(a*a)))  <= 1));
        let mouseOverRightBow = (((((x2*x2)/(b*b)) + ((y*y)/(a*a))) <= 1));

        // Obtenção das coordenadas dos centros (c1.2 e c2.2, que têm o mesmo valor y) e dos valores a/b de elipses
        // que vão auxiliar a parameterização do clique (duas elipses horizontais no interior do laço)
        let c1x2 = this.posx - (this.length * this.scale);
        let c2x2 = this.posx + (this.length * this.scale);
        let cy2  = this.posy - (this.length * this.scale)/25;
        let a2   = ((this.length * this.scale)/3) * 2.6;
        let b2   = ((this.length * this.scale)/3) * 1.3;

        // Aplicação da fórmula do interior de uma elipse
        let x12 = Math.abs(mx - c1x2);
        let x22 = Math.abs(mx - c2x2);
        let y2 = Math.abs(my - cy2);
        let mouseOverMiddleLeftBow  = (mx >= this.posx - (this.length * this.scale)/1.4) && (((((x12*x12)/(a2*a2)) + ((y2*y2)/(b2*b2)))  <= 1));
        let mouseOverMiddleRightBow = (mx <= this.posx + (this.length * this.scale)/1.4) && (((((x22*x22)/(a2*a2)) + ((y2*y2)/(b2*b2)))  <= 1));

        // Se o clique corresponder a qualquer uma das áreas estudadas então o laço foi de facto clicado
        let overBow =  this.bow.mouseOver(mx, my) || mouseOverLeftBow || mouseOverRightBow || mouseOverMiddleLeftBow || mouseOverMiddleRightBow;
        return overBow;
    }

    setPos(x, y){
        this.bow.setPos(x, y);
        super.setPos(x, y);
    }

    changeColor(color){
        super.changeColor(color);
        this.bow = new Oval(this.posx, this.posy, this.length/9.5, 1, 1, this.color, this.scale);
    }

    changeScale(newScale){
        super.changeScale(newScale);
        this.bow.changeScale(newScale);
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.quadraticCurveTo(this.posx - (this.length * this.scale)/1.05, this.posy + (this.length * this.scale)/1.4, this.posx - (this.length * this.scale)/1.05, this.posy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.quadraticCurveTo(this.posx - (this.length * this.scale)/1.05, this.posy - (this.length * this.scale), this.posx - (this.length * this.scale)/1.05, this.posy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.quadraticCurveTo(this.posx + (this.length * this.scale)/1.05, this.posy + (this.length * this.scale)/1.4, this.posx + (this.length * this.scale)/1.05, this.posy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.quadraticCurveTo(this.posx + (this.length * this.scale)/1.05, this.posy - (this.length * this.scale), this.posx + (this.length * this.scale)/1.05, this.posy);
        ctx.closePath();
        ctx.fill();
        this.bow.draw(cnv);
    }
}

class Ghost extends DrawingObjects
{
    constructor (px, py, width, color, scale) {
        super(px, py, 'G');
        this.width  = width;
        this.height = width/2.8;
        this.color  = color;
        this.scale  = scale;

        // Triângulos de baixo
        this.triangle1 = new Triangle(this.posx - this.width/2, this.posy+this.width/4.2, this.height/2, this.width/10, color, this.scale);
        this.triangle2 = new Triangle(this.posx - this.width/2 + (3*this.width)/10 + 0.3, this.posy+this.width/4.2, this.height/2, -2*this.width/10, color, this.scale);
        this.triangle3 = new Triangle(this.posx - this.width/2 + (3*this.width)/10, this.posy+this.width/4.2, this.height/2, 2*this.width/10, color, this.scale);
        this.triangle4 = new Triangle(this.posx + this.width/2, this.posy+this.width/4.2, this.height/2, -this.width/10, color, this.scale);
        this.triangle5 = new Triangle(this.posx + this.width/2 - (3*this.width)/10, this.posy+this.width/4.2, this.height/2, -2*this.width/10, color, this.scale);
        this.triangle6 = new Triangle(this.posx + this.width/2 - (3*this.width)/10 - 0.6, this.posy+this.width/4.2, this.height/2, 2*this.width/10, color, this.scale);

        // Olhos
        this.olhoEsquerdo = new Oval(this.posx - this.width/4, this.posy + this.width/30, this.width/8.5, 1, 1, "white", this.scale);
        this.olhoEsquerdoIris = new Oval(this.posx - this.width/3.5, this.posy + this.height/4.5, this.width/23, 1, 1, "black", this.scale);
        this.olhoDireito = new Oval(this.posx + this.width/4, this.posy + this.width/30, this.width/8.5, 1, 1, "white", this.scale);
        this.olhoDireitoIris = new Oval(this.posx + this.width/4.6, this.posy + this.height/4.5, this.width/23, 1, 1, "black", this.scale);    
    }

    mouseOver (mx, my) {
        // Parameterização de um retângulo horizontal de clique
        let mouseOverHorizontal = (mx >= this.posx - this.width*this.scale/2 && mx <= this.posx + this.width*this.scale/2) && (my <= this.posy+this.width*this.scale/4.1 && my >= this.posy + this.width*this.scale/30 - this.width*this.scale/8);
        // Parameterização de um retângulo vertical de clique
        let mouseOverVertical   = (mx >= this.posx - this.width*this.scale/4 + this.width*this.scale/10 && mx <= this.posx + this.width*this.scale/4 - this.width*this.scale/10) && (my <= this.posy-this.height*this.scale/4.1 && my >= this.posy - this.height*this.scale);

        // Obtenção e aplicação da fórmula de uma elipse que cobre a cabeça do fantasma
        let a = (this.posx - this.width*this.scale/2) - this.posx;
        let b = (this.posy - this.height*this.scale) - this.posy;
        let x = Math.abs(mx - this.posx);
        let y = Math.abs(my - this.posy);
        let mouseOverEllipse = (((((x*x)/(a*a)) + ((y*y)/(b*b))) <= 1.1) && (my <= this.posy-this.height*this.scale/4.1 && my >= this.posy - this.height*this.scale))

        // Se o clique for num dos triângulos ou em qualquer das áreas auxiliares parameterizadas, 
        // então o clique no fantasma é válido
        return (this.triangle1.mouseOver(mx, my) || this.triangle2.mouseOver(mx, my) ||
                this.triangle3.mouseOver(mx, my) || this.triangle4.mouseOver(mx, my) || mouseOverEllipse ||
                this.triangle5.mouseOver(mx, my) || this.triangle6.mouseOver(mx, my) || mouseOverHorizontal || mouseOverVertical);
    }

    setPos(px, py){
        super.setPos(px, py);
        this.triangle1.setPos(px - this.width * this.scale/2, py+this.width * this.scale/4.2);
        this.triangle2.setPos(px - this.width * this.scale/2 + (3*this.width * this.scale)/10 + 0.3, py+this.width * this.scale/4.2);
        this.triangle3.setPos(px - this.width * this.scale/2 + (3*this.width * this.scale)/10, py+this.width * this.scale/4.2);
        this.triangle4.setPos(px + this.width * this.scale/2, py+this.width * this.scale/4.2);
        this.triangle5.setPos(px + this.width * this.scale/2 - (3*this.width * this.scale)/10, py+this.width * this.scale/4.2);
        this.triangle6.setPos(px + this.width * this.scale/2 - (3*this.width * this.scale)/10 - 0.6, py+this.width * this.scale/4.2);
        this.olhoEsquerdo.setPos(px - this.width * this.scale/4, py + this.width * this.scale/30);
        this.olhoDireito.setPos(px + this.width * this.scale/4, py + this.width * this.scale/30);
        this.olhoEsquerdoIris.setPos(px - this.width * this.scale/3.5, py + this.height * this.scale/4.5);
        this.olhoDireitoIris.setPos(px + this.width * this.scale/4.6, py + this.height * this.scale/4.5);
    }

    changeScale(newScale){
        super.changeScale(newScale);
        this.triangle1.changeScale(newScale);
        this.triangle2.changeScale(newScale);
        this.triangle3.changeScale(newScale);
        this.triangle4.changeScale(newScale);
        this.triangle5.changeScale(newScale);
        this.triangle6.changeScale(newScale);
        this.olhoEsquerdo.changeScale(newScale);
        this.olhoEsquerdoIris.changeScale(newScale);
        this.olhoDireito.changeScale(newScale);
        this.olhoDireitoIris.changeScale(newScale);
        this.setPos(this.posx, this.posy);
    }

    changeColor(color){
        super.changeColor(color);
        this.triangle1.changeColor(color);
        this.triangle2.changeColor(color);
        this.triangle3.changeColor(color);
        this.triangle4.changeColor(color);
        this.triangle5.changeColor(color);
        this.triangle6.changeColor(color);
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");
        ctx.fillStyle = this.color;        

        // Cabeça do fantasma com curvas quadráticas (dá-se 1 ponto por onde a reta "curva")
        // lado esquerdo
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.posx - this.width*this.scale/2, this.posy+this.width*this.scale/4.1)
        ctx.lineTo(this.posx - this.width*this.scale/2, this.posy);
        ctx.quadraticCurveTo(this.posx - this.width*this.scale/2, this.posy - this.height*this.scale, this.posx + 0.5, this.posy - this.height*this.scale/1);
        ctx.lineTo(this.posx + 0.5, this.posy+this.width*this.scale/4);
        ctx.closePath();
        ctx.fill();

        // lado direito
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.posx + this.width*this.scale/2, this.posy+this.width*this.scale/4.1)
        ctx.lineTo(this.posx + this.width*this.scale/2, this.posy);
        ctx.quadraticCurveTo(this.posx + this.width*this.scale/2, this.posy - this.height*this.scale, this.posx, this.posy - this.height*this.scale/1);
        ctx.lineTo(this.posx, this.posy+this.width*this.scale/4);
        ctx.closePath();
        ctx.fill();

        this.triangle1.draw(cnv);
        this.triangle2.draw(cnv);
        this.triangle3.draw(cnv);
        this.triangle4.draw(cnv);
        this.triangle5.draw(cnv);
        this.triangle6.draw(cnv);
        this.olhoEsquerdo.draw(cnv);
        this.olhoDireito.draw(cnv);
        this.olhoEsquerdoIris.draw(cnv);
        this.olhoDireitoIris.draw(cnv);
    }
}
    
class Gingerbread extends DrawingObjects
{
    constructor (px, py, height, color, scale) {
        super(px, py, 'Ginger');
        this.radius = height/3;
        this.width  = height/1.5;
        this.height = height;
        this.color  = color;
        this.scale  = scale;

        this.cabeca = new Oval(this.posx, this.posy, this.radius*1.05, 1, 1, this.color, this.scale);
        this.olhoEsquerdo = new Oval(this.posx - this.radius/2.5, this.posy - this.radius/5, this.radius/7.14, 1, 1, "white", this.scale);
        this.olhoDireito = new Oval(this.posx + this.radius/2.5, this.posy - this.radius/5, this.radius/7.14, 1, 1, "white", this.scale);
        this.maoEsquerda = new Oval(this.posx - this.width/1.4, this.posy + this.radius/1.3 + (this.height/2.5)/2, (this.height/2.5)/2, 1, 1, this.color, this.scale);
        this.maoDireita  = new Oval(this.posx + this.width/1.4, this.posy + this.radius/1.3 + (this.height/2.5)/2, (this.height/2.5)/2, 1, 1, this.color, this.scale);

        this.peEsquerdo = new Oval(this.posx - this.width/2.1, this.posy + this.radius/2.1 + (this.height), (this.height/2.5)/2, 1, 1, this.color, this.scale);
        this.peDireito  = new Oval(this.posx + this.width/2.1, this.posy + this.radius/2.1 + (this.height), (this.height/2.5)/2, 1, 1, this.color, this.scale);

        this.upperButton = new Oval(this.posx, this.posy + this.height/2.3, this.radius/5, 1, 1, "purple", this.scale);
        this.lowerButton = new Oval(this.posx, this.posy + this.height/1.5, this.radius/5, 1, 1, "purple", this.scale);

        this.bracos = new Rect(this.posx - this.width/1.4, this.posy + this.radius/1.3, (this.width * 2)/1.4, this.height/2.5, this.color, this.scale);
    }

    mouseOver (mx, my) {
        // Parameterizações auxiliares para retas afim que definem as pernas:
        // SE > Superior Esquerda      IE > Inferior Esquerda
        // Se o clique for abaixo da reta SE e acima da IE, não ultrapassando os limites em x (até ao fim do pé e meio da barriga)
        // o clique nessa perna é válido
        let xSE = this.posx - this.width * this.scale/1.7 + (this.height * this.scale/2.5)/2;
        let ySE = (this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2) * -1;
        let offsetxSE = this.posx - this.width * this.scale/2.4 - (this.height * this.scale/2.5)/2;
        let offsetySE = (this.posy + (this.height * this.scale*1.05)) * -1;
        let retaSEm = (ySE - offsetySE)/(xSE - offsetxSE);
        let underRetaSE = ((-my - offsetySE) <= retaSEm * (mx - offsetxSE));
        let offsetxIE = this.posx - this.width * this.scale/1.7 + (this.height * this.scale/2.5)/2 + (this.height * this.scale/2.5);
        let offsetyIE = (this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2) * -1;
        let aboveRetaIE = ((-my - offsetyIE) >= retaSEm * (mx - offsetxIE));
        let overLeftLeg = underRetaSE && aboveRetaIE && my >= this.posy + this.radius * this.scale/1.3 +this.height * this.scale/2.5 && my <= this.posy + this.radius * this.scale/2.1 + (this.height * this.scale);

        // Parameterizações auxiliares para retas afim que definem as pernas:
        // SD > Superior Direita      ID > Inferior Direita
        // Se o clique for abaixo da reta SD e acima da ID, não ultrapassando os limites em x (até ao fim do pé e meio da barriga)
        // o clique nessa perna é válido
        let xSD = this.posx + this.width * this.scale/1.7 - (this.height * this.scale/2.5)/2;
        let ySD = (this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2) * -1;
        let offsetxSD = this.posx + this.width * this.scale/2.4 + (this.height * this.scale/2.5)/2;
        let offsetySD = (this.posy + (this.height * this.scale*1.05)) * -1;
        let retaSDm = (ySD - offsetySD)/(xSD - offsetxSD);
        let underRetaSD = ((-my - offsetySD) <= retaSDm * (mx - offsetxSD));
        let offsetxID = this.posx + this.width * this.scale/1.7 - (this.height * this.scale/2.5)/2 - (this.height * this.scale/2.5);
        let offsetyID = (this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2) * -1;
        let aboveRetaID = ((-my - offsetyID) >= retaSDm * (mx - offsetxID));
        let overRightLeg = underRetaSD && aboveRetaID && my >= this.posy + this.radius * this.scale/1.3 +this.height * this.scale/2.5 && my <= this.posy + this.radius * this.scale/2.1 + (this.height * this.scale);

        // Se o clique for numa das ovais de cara, mãos ou pés; no retângulo dos braços; ou na área de uma das pernas, o
        // clique no boneco de gengibre é dado como válido
        return this.cabeca.mouseOver(mx, my) || this.maoDireita.mouseOver(mx,my) || this.maoEsquerda.mouseOver(mx,my) || 
               this.bracos.mouseOver(mx, my) || this.peDireito.mouseOver(mx, my) || this.peEsquerdo.mouseOver(mx, my) || overLeftLeg || overRightLeg;
    }

    setPos(px, py){
        super.setPos(px, py);
        this.cabeca.setPos(px, py);
        this.olhoEsquerdo.setPos(px - this.radius * this.scale /2.5, py - this.radius * this.scale /4.85);
        this.olhoDireito.setPos(px + this.radius * this.scale /2.5, py - this.radius * this.scale /4.85);
        this.bracos.setPos(px - this.width * this.scale /1.4, py + this.radius * this.scale /1.3, (this.width * this.scale  * 2)/1.4, this.height * this.scale /2.5);
        this.maoDireita.setPos(px + this.width * this.scale /1.4, py + this.radius * this.scale /1.3 + (this.height * this.scale /2.5)/2);
        this.maoEsquerda.setPos(px - this.width * this.scale /1.4, py + this.radius * this.scale /1.3 + (this.height * this.scale /2.5)/2);
        this.peEsquerdo.setPos(px - this.width * this.scale /2.1, py + this.radius * this.scale /2.1 + (this.height * this.scale ));
        this.peDireito.setPos(px + this.width * this.scale /2.1, py + this.radius * this.scale /2.1 + (this.height * this.scale ));
        this.upperButton.setPos(px, py + this.height * this.scale /2.3);
        this.lowerButton.setPos(px, py + this.height * this.scale /1.5);
    }

    changeColor(color){
        super.changeColor(color);
        this.cabeca.changeColor(color);
        this.maoEsquerda.changeColor(color);
        this.maoDireita.changeColor(color);
        this.peEsquerdo.changeColor(color);
        this.peDireito.changeColor(color);
        this.bracos.changeColor(color);
    }

    changeScale(newScale){
        super.changeScale(newScale);
        this.cabeca.changeScale(newScale);
        this.olhoEsquerdo.changeScale(newScale);
        this.olhoDireito.changeScale(newScale);
        this.maoEsquerda.changeScale(newScale);
        this.maoDireita.changeScale(newScale);
        this.peEsquerdo.changeScale(newScale);
        this.peDireito.changeScale(newScale);
        this.upperButton.changeScale(newScale);
        this.lowerButton.changeScale(newScale);
        this.bracos.changeScale(newScale);
        this.setPos(this.posx, this.posy);
    }

    draw (cnv) {
        let ctx = cnv.getContext("2d");
        
        this.cabeca.draw(cnv);
        this.olhoEsquerdo.draw(cnv);
        this.olhoDireito.draw(cnv);
        this.bracos.draw(cnv);
        this.maoEsquerda.draw(cnv);
        this.maoDireita.draw(cnv);
        this.peEsquerdo.draw(cnv);
        this.peDireito.draw(cnv);
        
        ctx.fillStyle = this.color;      
        ctx.strokeStyle = this.color;
        
        // Retas das pernas:
        // Esquerda
        ctx.beginPath();
        ctx.moveTo(this.posx - this.width * this.scale/1.7 + (this.height * this.scale/2.5)/2, this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2);
        ctx.lineTo(this.posx - this.width * this.scale/2.4 - (this.height * this.scale/2.5)/2, this.posy + (this.height * this.scale*1.05));
        ctx.lineTo(this.posx - this.radius * this.scale/2.52, this.posy + this.height * this.scale*1.22);
        ctx.lineTo(this.posx - this.width * this.scale/1.7 + (this.height * this.scale/2.5)/2 + (this.height * this.scale/2.5), this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Direita
        ctx.beginPath();
        ctx.moveTo(this.posx + this.width * this.scale/1.7 - (this.height * this.scale/2.5)/2, this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2);
        ctx.lineTo(this.posx + this.width * this.scale/2.4 + (this.height * this.scale/2.5)/2, this.posy + (this.height * this.scale*1.05));
        ctx.lineTo(this.posx + this.radius * this.scale/2.52, this.posy + this.height * this.scale*1.22);
        ctx.lineTo(this.posx + this.width * this.scale/1.7 - (this.height * this.scale/2.5)/2 - (this.height * this.scale/2.5), this.posy + this.radius * this.scale/1.3 + (this.height * this.scale/2.5)/2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Boca
        ctx.strokeStyle = "IndianRed";
        ctx.beginPath();
        ctx.arc(this.posx, this.posy + this.height * this.scale/20, this.radius * this.scale / 4, 0, Math.PI, false);
        ctx.stroke();

        this.upperButton.draw(cnv);
        this.lowerButton.draw(cnv);
    }
}

class Text extends DrawingObjects{
    constructor (text, px, py, height, width, c, scale) {
        super(px, py, 'Text');
        this.text   = text;
        this.height = height;
        this.width  = width;
        this.color  = c;
        this.scale  = scale; 
    }

    draw(cnv){
        let ctx = cnv.getContext("2d");
        
        // Tranforma-se o height*escala em string para reconhecer o tamanho em arial
        ctx.font = ((this.height * this.scale) + 'px Arial');
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.posx, this.posy);

        // Função que mede a largura do texto
        let textWidth = ctx.measureText(this.text);
        // Atualização da largura (que muda caso se mude a escala)
        this.width = textWidth.width;
    }

    mouseOver(mx, my){
        // Retângulo à volta do texto
        if (mx >= this.posx && my <= this.posy && my >= this.posy - (this.height * this.scale) && mx <= this.posx + (this.width)) return true;
        else return false;
    }
}