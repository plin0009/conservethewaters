let space = new Space();
const SYMBOLS = {
    runoff: ['water', 'water2', 'water3', 'water4'], // todo
    trash: ['water', 'water2', 'water3', 'water4'],
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
        //let g = new RunoffGame();
        space.show();
        return true;
    },
    trash: () => {
        space.reset();
        console.log('Litter game goes here');
        space.show();
        return true;
    },
    wetlands: () => {
        space.reset();
        console.log('Wetlands game goes here');
        space.show();
        return true;
    },
}

class RunoffGame extends Game {
    constructor() {
        super();
    }
}