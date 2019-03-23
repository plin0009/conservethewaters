let space = new Space();
const symbols = ['water', 'water2', 'water3', 'water4'];
window.onload = async () => {
    paper.setup('game');
    paper.view.onResize = () => space.update();
    await load();
    console.log('after loading!');
    menu();
}

const load = async () => {
    space.reset();
    let percentage = new Text('percentage', '0%', 'number', 0.8, {x:0.5,y:0.5});
    space.addLayer(new Layer('loading'))
    .addSprite(percentage);
    space.show();
    for (let i = 0; i < symbols.length; i++) {
        console.log(`at ${i}`);
        await space.loadSymbol(symbols[i]);
        percentage.updateText(`${Math.ceil((i + 1) * 100 / symbols.length)}%`);
    }
    console.log('finished loading');
    await new Promise((resolve, reject) => setTimeout(resolve, 500));
}

const menu = () => {
    space.reset();
    space.addLayer(new Layer('waters'))
    .addSprite(new Text('title', 'Save the Waters', 'header', 0.8, {x:0.5,y:0.3}))
    .addSprite(new Button('play', new paper.SymbolItem(space.symbols.water4), intro, 0.4, {x:0.5,y:0.7}));
    space.show();
}

const intro = () => {
    space.reset();
    // paragraph and buttons
    return true;
}