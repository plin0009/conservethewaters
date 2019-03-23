class Space {
    constructor() {
        this.symbols = {};
        this.layers = [];
    }
    loadSymbol(name) {
        return new Promise((resolve, reject) => {
            paper.project.importSVG(`img/${name}.svg`, item => {
                this.symbols[name] = new paper.SymbolDefinition(item);
                resolve();
            });
        });
    }
    addLayer(layer) {
        this.layers.push(layer);
        return layer;
    }
    reset() {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            this.layers[i].object.remove();
            delete this.layers[this.layers[i].name];
            this.layers.shift();
        }
    }
    show() {
        for (let i = 0; i < this.layers.length; i++) {
            console.log(i, this.layers.length);
            this.layers[i].object.visible = this.layers[i].visible;
        }
    }
    update() {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].update();
        }
    }
}

class Layer {
    constructor(name, visible = true, settings = {}) {
        this.children = [];
        this.name = name;
        this.visible = visible;
        this.object = new paper.Layer({
            ...settings,
            visible: false
        });
    }
    update() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update();
        }
    }
    addSprite(sprite) {
        this.children.push(sprite);
        (sprite.created && this.object.addChild(sprite.object)) || (sprite.created = () => {
            this.object.addChild(sprite.object);
        });
        console.log(sprite);
        return this;
    }
}

class Sprite {
    constructor(name, scale, position, scaleOn = 'width') {
        this.created = false;
        this.name = name;
        this.scale = scale;
        this.scaleOn = scaleOn;
        this.position = position;
    }
    exist() {
        this.update();
        (this.created && this.created()) || (this.created = true);
    }
    update() {
        this.updateScale();
        this.updatePosition();
    }
    updateScale() {
        this.object.scale(this.scale * paper.view.viewSize[this.scaleOn] / this.object.bounds[this.scaleOn]);
    };
    updatePosition() {
        this.object.position = new paper.Point(this.position.x * paper.view.viewSize.width, this.position.y * paper.view.viewSize.height);
    };
}

class Symbol extends Sprite {
    constructor(name, symbol, scale, position, scaleOn) {
        super(name, scale, position, scaleOn);
        this.object = new paper.SymbolItem(symbol);
        this.exist();
    }
}

class Text extends Sprite {
    constructor(name, text, styleName, scale, position, scaleOn) {
        super(name, scale, position, scaleOn);
        this.text = text;
        switch (styleName) {
            case 'header':
                this.style = {
                    color: '#009ad6',
                    font: 'Capriola'
                };
                break;
            case 'number':
                this.style = {
                    color: '#009ad6',
                    font: 'Vanilla'
                };
                break;
            default:
                this.style = {
                    color: '#ffffff',
                    font: 'Arial'
                };
        }
        this.object = new paper.PointText({
            content: this.text,
            fillColor: this.style.color,
            fontFamily: this.style.font
        });
        this.exist();
    }
    updateText(text) {
        this.text = text;
        this.object.content = this.text;
        this.update();
    }
}

class Button extends Sprite {
    constructor(name, labelObject, action, scale, position, scaleOn) {
        super(name, scale, position, scaleOn);
        this.action = action;
        
        this.object = new paper.Group();
        this.object.onMouseEnter = () => this.hover();
        this.object.onMouseLeave = () => this.rest();
        this.object.onMouseDown = () => this.down();
        this.object.onClick = () => (this.rest() || this.action()) || this.hover();
        this.button = new paper.Shape.Rectangle(new paper.Rectangle(-112.5,-62.5,225,125), 10);
        this.button.strokeWidth = 8;
        this.object.addChild(this.button);
        this.label = labelObject;
        this.label.scale(0.5);
        this.object.addChild(this.label);
        this.rest();
        this.exist();
    }
    rest() {
        this.label.fillColor = "#ffffff";
        this.button.strokeColor = '#00aae6';
        this.button.fillColor = '#009ad6';
        document.getElementById('game').style.cursor = 'default';
    }
    hover() {
        this.button.strokeColor = '#00baef';
        this.button.fillColor = '#00aae6';
        document.getElementById('game').style.cursor = 'pointer';
    }
    down() {
        this.button.strokeColor = '#009ac6';
        this.button.fillColor = '#008ac6';
    }
}