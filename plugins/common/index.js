const Plugin = require('../../core/Plugin');

const Gamepad = require('./devices/Gamepad');
const Keyboard = require('./devices/Keyboard');
const Mouse = require('./devices/Mouse');

const fragment = require('./shaders/default/fragment');
const vertex = require('./shaders/default/vertex');

const container = document.createElement('main');
document.body.appendChild(container);

const transparent = document.createElement('canvas');
transparent.width = 16;
transparent.height = 16;

const transparentContext = transparent.getContext('2d');
transparentContext.fillStyle = '#FFFFFF';
transparentContext.fillRect(8, 0, 8, 8);
transparentContext.fillRect(0, 8, 8, 8);
transparentContext.fillStyle = '#D3D4D6';
transparentContext.fillRect(0, 0, 8, 8);
transparentContext.fillRect(8, 8, 8, 8);

const black = document.createElement('canvas');
black.width = 32;
black.height = 32;

const blackContext = black.getContext('2d');
blackContext.fillStyle = '#0000FF';
blackContext.fillRect(0, 0, 32, 32);

function render (game, asset) {
    //requestAnimationFrame(() => render(game));

    game.renderer.clear();
    // game.renderer.dimensions(2);

    for (let x = 0; x < 1024; x += 16) {
        for (let y = 0; y < 576; y += 16) {
            game.renderer.draw({
                texture: transparent,
                size: {
                    height: 16,
                    width: 16
                },
                position: {
                    x: x,
                    y: y
                }
            });
        }
    }

    game.renderer.draw({
        texture: asset,
        size: {
            height: 32,
            width: 32
        },
        position: {
            x: 32,
            y: 32
        }
    });
}

module.exports = new Plugin('common', game => {
    const std = game.libraries.use('std');

    const gamepad = new Gamepad('gamepad');
    const keyboard = new Keyboard('keyboard');
    const mouse = new Mouse('mouse');

    game.devices.install(gamepad);
    game.devices.install(keyboard);
    game.devices.install(mouse);

    game.renderer.subscribe('attach').forEach(() => {
        game.renderer.bind('default', [ fragment, vertex ]);
    });

    game.connection.subscribe('handshake').forEach(() => {
        game.tasks.create('authenticate', [ 'admin', '1234' ]);
    });

    game.tasks.subscribe('authorize').forEach(() => {
        game.tasks.create('handshake', game.connection.id);
        game.assets.download('shrek.gif').then(asset => {
            asset.onload = () => {
                const player = std.entities.player.create({
                    position: {
                        x: 100,
                        y: 100
                    },
                    size: {
                        width: 64,
                        height: 64
                    },
                    texture: {
                        data: asset
                    }
                });

                game.loop.subscribe('draw').forEach(() => {
                    std.systems.render2d.run(player, game);
                });

                game.loop.start();
            }
        });
    });
    game.viewport.mount(container);
    game.viewport.resize({ width: 1024, height: 576 });

    global.game = game;
});