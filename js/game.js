let space = new Space();
const SYMBOLS = {
    runoff: ['fertilizer', 'pill', 'insecticide', 'share', 'support'], // todo
    trash: ['bucket', 'bottle1', 'bottle2', 'can1', 'can2', 'cup1', 'cup2', 'wave', 'share', 'support'],
    wetlands: ['water', 'water2', 'water3', 'water4'],
};
openGame = async (game) => {
    document.getElementById('container').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    paper.setup('game');
    paper.view.onResize = () => space.update();
    await load(SYMBOLS[game]);
    console.log('loaded assets!');
    introduce(game);
}

const load = async (symbols) => {
    space.reset();
    let percentage = new Text('percentage', '0%', 'number', 0.8, {x:0.5,y:0.5});
    space.addLayer(new Layer('loading'))
    .addSprite(percentage);
    space.show();
    for (let i = 0; i < symbols.length; i++) {
        await space.loadSymbol(symbols[i]);
        percentage.updateText(`${Math.ceil((i + 1) * 100 / symbols.length)}%`);
    }
    await new Promise((resolve, reject) => setTimeout(resolve, 500));
}
const instructions = {
    runoff: {
        title: 'Control the Runoff',
        desc: 'Stop the chemicals from reaching the Lake.',
        desc2: 'Tap the pollutants as fast as you can!'
    },
    trash: {
        title: 'Filter the Litter',
        desc: 'Keep the trash away from the Lake.',
        desc2: 'Move your bucket from side to side to catch the litter!'
    },
    wetlands: {
        title: 'Restore the Wetlands',
        desc: 'Bring back the water flow and the plants.',
        desc2: 'Fill the tiles with water and plants over time!'
    }
}
const introduce = (name) => {
    space.reset();
    space.addLayer(new Layer('text'))
    .addSprite(new Text('title', instructions[name].title, 'header', 0.8, {x:0.5,y:0.3}))
    .addSprite(new Text('desc', instructions[name].desc, '', 0.8, {x:0.5,y:0.5}))
    .addSprite(new Text('desc2', instructions[name].desc2, '', 0.8, {x:0.5,y:0.6}))
    .addSprite(new Text('guide', '(Tap to start)', '', 0.2, {x:0.5,y:0.8}));
    space.click = () => games[name]();
    space.show();
    return true;
};

const games = {
    runoff: () => {
        space.reset();
        console.log('Runoff game goes here');
        let g = new RunoffGame(space);
        paper.view.onFrame = () => g.update();
        space.show();
        return true;
    },
    trash: () => {
        space.reset();
        console.log('Litter game goes here');
        let g = new TrashGame(space);
        paper.view.onFrame = () => g.update();
        space.show();
        return true;
    },
    wetlands: () => {
        space.reset();
        let g = new WetlandsGame(space);
        paper.view.onFrame = () => g.update();
        space.show();
        return true;
    },
}

class RunoffGame extends Game {
    constructor(space) {
        super(space);
        this.maxCooldown = 100;
        this.cooldown = this.maxCooldown;
        this.score = 0;
        this.health = 50;
        this.condition = 'Healthy';
        this.over = false;
        this.properties = {
            fertilizer: {
                spin: 1,
                speed: 6,
                size: 0.23,
                damage: 5
            },
            pill: {
                spin: 4,
                speed: 2,
                size: 0.1,
                damage: 2
            },
            insecticide: {
                spin: 2,
                speed: 4,
                size: 0.12,
                damage: 3
            }
        };

        this.healthDisplay = new Text('health', 'Lake Condition: Healthy', '', 0.7, {x:0.5,y:0.8});
        this.scoreDisplay = new Text('score', '0', 'number', 0.1, {x:0.5,y:0.3}, 'height');
        this.lake = new Rect('lake', new paper.Color((-this.health + 50) / 255, (139 + this.health * 0.3) / 255, (29 + this.health * 3.7) / 255), 1, 0.1, {x:0.5,y:0.95}, 'height');
        this.nature = this.space.addLayer(new Layer('nature'))
        .addSprite(this.lake);
        this.ui = this.space.addLayer(new Layer('ui'))
        .addSprite(this.scoreDisplay)
        .addSprite(this.healthDisplay);
        this.falling = this.space.addLayer(new Layer('falling'));
    }
    update() {
        if (this.stopped) {
            if (!this.over) {
                this.proceed();
                this.over = true;
            }
        }
        this.cooldown--;
        if (!this.cooldown) {
            let pollutant = ['fertilizer', 'pill', 'pill', 'insecticide'][Math.floor(Math.random() * 4)]
            let symbol = new Symbol('', this.space.symbols[pollutant], this.properties[pollutant].size, {x:0.15+Math.random() * 0.7, y:-0.2});
            symbol.pollutant = pollutant;
            symbol.spin = this.properties[pollutant].spin;
            symbol.speed = this.properties[pollutant].speed;
            symbol.damage = this.properties[pollutant].damage;
            symbol.object.onClick = () => {
                if (this.stopped)   return;
                this.falling.removeSprite(symbol);
                this.score += 100;
                this.scoreDisplay.updateText(''+this.score);
            }
            this.falling.addSprite(symbol);
            this.maxCooldown > 40 && (this.maxCooldown -= 2);
            this.cooldown = this.maxCooldown;
        }
        for (let i = 0; i < this.falling.children.length; i++) {
            let symbol = this.falling.children[i];
            symbol.position.y += symbol.speed * 0.001;
            symbol.rotation += symbol.spin * 0.5;
            if (symbol.position.y > 1.2) {
                this.health -= symbol.damage;
                if (this.health > 45) {
                    this.condition = "Healthy";
                }
                else if (this.health > 30) {
                    this.condition = "Moderate";
                }
                else if (this.health > 15) {
                    this.condition = "Unhealthy";
                }
                else if (this.health > 10) {
                    this.condition = "Disastrous";
                } else {
                    this.end();
                }
                this.lake.updateColor(new paper.Color((-this.health + 50) / 255, (139 + this.health * 0.3) / 255, (29 + this.health * 3.7) / 255));
                this.healthDisplay.updateText(`Lake Condition: ${this.condition}`);
                this.falling.removeSprite(symbol);
                i--;
            }
        }
        super.update();
    }
    end() {
        this.ui.removeSprite(this.healthDisplay);
        this.stopped = true;
    }
    proceed() {
        let snapshot = document.getElementById('game').toDataURL("image/png");
        this.gameOver(snapshot);
    }
    gameOver(png) {
        this.over = true;
        this.space.reset();
        let snapshot = new paper.Raster({
            source: png,
            position: paper.view.center
        });
        snapshot.scale(0.4);
        snapshot.rotate(2);
        this.space.addLayer(new Layer('share'))
        .addSprite(new Text('', 'Challenge your friends!', 'header', 0.8, {x:0.5,y:0.15}))
        .addSprite(new Text('', 'Spread awareness by sharing your score!', '', 0.8, {x:0.5,y:0.25}))
        .addSprite(new Text('', 'Did you know?', '', 0.3, {x:0.5,y:0.9}))
        .addSprite(new Text('', randomFact(), '', 0.8, {x:0.5,y:0.95}))
        .addSprite(new Button('share', new paper.SymbolItem(this.space.symbols.share), () => window.open('https://www.facebook.com/sharer.php?u=https%3A%2F%2Fplin0009.github.io%2Fconservethewaters%2F', '_blank'), 0.2, {x:0.35, y:0.8}))
        .addSprite(new Button('support', new paper.SymbolItem(this.space.symbols.support), () => window.open('support.html', '_blank'), 0.2, {x:0.65, y:0.8}));
        this.space.show();
    }
}

class TrashGame extends Game {
    constructor(space) {
        super(space);
        this.maxCooldown = 100;
        this.cooldown = this.maxCooldown;
        this.score = 0;
        this.lives = 3;
        this.movements = [{
            start: -0.2,
            deriv: -4,
            derivb: 1,
            direction: 1
        },{
            start: -0.3,
            deriv: -5,
            derivb: 1,
            direction: 1
        },{
            start: 1.2,
            deriv: -4,
            derivb: 3,
            direction: -1
        },{
            start: 1.3,
            deriv: -5,
            derivb: 4,
            direction: -1
        }];
        this.over = false;
        this.bucket = new Symbol('', space.symbols.bucket, 0.2, {x:0.3,y:0.75});
        this.bucketHitbox = new Rect('bucketHitbox','#000000', 0.08, 0.08, {x:0.3,y:0.75}); 
        this.backdrop = new Rect('backdrop', '#cceeff', 1, 1, {x:0.5,y:0.5});
        this.livesDisplay = new Text('lives', `${this.lives} lives`, '', 0.1, {x:0.5,y:0.1});
        this.scoreDisplay = new Text('score', '0', 'number', 0.1, {x:0.5,y:0.3}, 'height');
        this.lake = new Rect('lake', '#009ad6', 1, 0.1, {x:0.5,y:0.95});
        //this.wave = new Symbol('wave', space.symbols.wave, 0.2, {x:1.5,y:0.88});
        this.background = this.space.addLayer(new Layer('background'))
        .addSprite(this.backdrop);
        this.nature = this.space.addLayer(new Layer('nature'))
        .addSprite(this.lake)
        //.addSprite(this.wave);
        this.ui = this.space.addLayer(new Layer('ui'))
        .addSprite(this.livesDisplay)
        .addSprite(this.scoreDisplay);
        this.catcher = this.space.addLayer(new Layer('catcher'))
        .addSprite(this.bucketHitbox)
        .addSprite(this.bucket);
        this.falling = this.space.addLayer(new Layer('falling'));

        window.onmousedown = () => this.held = true;
        window.onmouseup = () => this.held = false;
        window.onkeydown = () => this.held = true;
        window.onkeyup = () => this.held = false;
    }
    update() {
        if (this.stopped) {
            if (!this.over) {
                this.proceed();
                this.over = true;
            }
        }
        /* this.wave.position.x -= 0.01;
        if (this.wave.position.x < -0.5) {
            this.wave.position.x = 1.5;
        } */
        this.cooldown--;
        if (!this.cooldown) {
            let garbage = ['bottle1', 'bottle2', 'can1', 'can2', 'cup1', 'cup2'][Math.floor(Math.random() * 6)];
            let movement = this.movements[Math.floor(Math.random() * 4)];
            let symbol = new Symbol('', this.space.symbols[garbage], 0.1, {x:movement.start, y:0.7});
            symbol.deriv = movement.deriv;
            symbol.derivb = movement.derivb;
            symbol.direction = movement.direction;
            symbol.spin = Math.random() * 3 - 1.5;
            this.falling.addSprite(symbol);
            this.maxCooldown > 30 && (this.maxCooldown -= 3);
            this.cooldown = this.maxCooldown;
        }
        this.bucket.position.x -= 0.05;
        this.held && (this.bucket.position.x += 0.1);
        if (this.bucket.position.x < 0.3) {
            this.bucket.position.x = 0.3;
        } else if (this.bucket.position.x > 0.7) {
            this.bucket.position.x = 0.7;
        }
        this.bucketHitbox.position.x = this.bucket.position.x;
        for (let i = 0; i < this.falling.children.length; i++) {
            let symbol = this.falling.children[i];
            symbol.position.x += 0.01 * symbol.direction;
            symbol.position.y -= 0.01 * symbol.direction * (symbol.position.x * symbol.deriv + symbol.derivb);
            symbol.rotation += symbol.spin;
            if (symbol.position.y > 1.2) {
                this.falling.removeSprite(symbol);
                i--;
                this.lives--;
                this.livesDisplay.updateText(`${this.lives} ${this.lives == 1 ? 'life' : 'lives'}`);
                this.backdrop.updateColor(["#f4d0cd", "#eae4ff", "#e0e4ff"][this.lives]);
                if (!this.lives) {
                    this.end();
                }
            }
            else if (this.bucketHitbox.object.intersects(symbol.object)) {
                this.falling.removeSprite(symbol);
                this.score += 100;
                this.scoreDisplay.updateText(''+this.score);
            }
        }
        super.update();
    }
    end() {
        this.ui.removeSprite(this.livesDisplay);
        this.stopped = true;
    }
    proceed() {
        let snapshot = document.getElementById('game').toDataURL("image/png");
        this.gameOver(snapshot);
    }
    gameOver(png) {
        this.over = true;
        this.space.reset();
        let snapshot = new paper.Raster({
            source: png,
            position: paper.view.center
        });
        snapshot.scale(0.4);
        snapshot.rotate(2);
        this.space.addLayer(new Layer('share'))
        .addSprite(new Text('', 'Challenge your friends!', 'header', 0.8, {x:0.5,y:0.15}))
        .addSprite(new Text('', 'Spread awareness by sharing your score!', '', 0.8, {x:0.5,y:0.25}))
        .addSprite(new Text('', 'Did you know?', '', 0.3, {x:0.5,y:0.9}))
        .addSprite(new Text('', randomFact(), '', 0.8, {x:0.5,y:0.95}))
        .addSprite(new Button('share', new paper.SymbolItem(this.space.symbols.share), () => window.open('https://www.facebook.com/sharer.php?u=https%3A%2F%2Fplin0009.github.io%2Fconservethewaters%2F', '_blank'), 0.2, {x:0.35, y:0.8}))
        .addSprite(new Button('support', new paper.SymbolItem(this.space.symbols.support), () => window.open('support.html', '_blank'), 0.2, {x:0.65, y:0.8}));
        this.space.show();
    }
}

class WetlandsGame extends Game {
    constructor(space) {
        super(space);
        this.comingSoon = new Text('soon', 'Coming Soon!', 'header', 0.8, {x:0.5,y:0.3});
        this.ui = this.space.addLayer(new Layer('ui'))
        .addSprite(this.comingSoon);
    }
    update() {
        if (this.stopped)   return;
        super.update();
    }
    end() {
        this.stopped = true;
    }
}

const randomFact = () => {
    const facts = [
        'Fertilizers in runoff pollution causes algae blooms, which makes water toxic to us.',
        'Water pollution is the most critical environment concern after air pollution.',
        'Wash your car in the car wash instead of your driveway.',
        'Wetlands are naturall a filter to our lakes, thus they are crucial to conserve.',
        'Don\'t dump anything down the stormwater drains!',
        'Pharmaceuticals and toxic chemicals should never be flushed down the drain!',
        'Phosphorus pollution from agricultural and urban sources cause algae blooms.',
        'Please pick up after your pet!'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
}