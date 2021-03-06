const Module = require('quantum/core/Module');

module.exports = class World extends Module {

    get player () {
        return this.state.get('player');
    }

    get entities () {
        return this.state.get('entities');
    }

    get chunks () {
        return this.state.get('chunks');
    }

    set chunks (chunks) {
        return this.state.set('chunks', chunks);
    }

    constructor (host) {
        super(host);

        this.state = new Map([
            [ 'player', null ],
            [ 'entities', new Set() ]
        ]);
    }

    connect () {
        this[ Module.host ].initializer.subscribe('delete').forEach(method => this.forget(...method.arguments));
    }

    begin (id) {
        this.state.set('player', id);
    }

    end () {
        this.state.set('player', null);
    }

    navigate (direction) {
        const { chunks, origin } = direction;
        const {
            NORTH_WEST, NORTH, NORTH_EAST,
            WEST, ORIGIN, EAST,
            SOUTH_WEST, SOUTH, SOUTH_EAST
        } = World.compass;

        switch (direction.origin) { // TODO add other 4 cases
            case NORTH: {
                this.chunks = [
                    chunks[ 0 ], chunks[ 1 ], chunks[ 2 ],
                    this.chunks[ NORTH_WEST ], this.chunks[ NORTH ], this.chunks[ NORTH_EAST ],
                    this.chunks[ WEST ], this.chunks[ ORIGIN ], this.chunks[ EAST ]
                ];
                break;
            }
            case EAST: {
                this.chunks = [
                    this.chunks[ NORTH ], this.chunks[ NORTH_EAST ], chunks[ 0 ],
                    this.chunks[ ORIGIN ], this.chunks[ EAST ], chunks[ 1 ],
                    this.chunks[ SOUTH ], this.chunks[ SOUTH_EAST ], chunks[ 2 ]
                ];
                break;
            }
            case SOUTH: {
                this.chunks = [
                    this.chunks[ WEST ], this.chunks[ ORIGIN ], this.chunks[ EAST ],
                    this.chunks[ SOUTH_WEST ], this.chunks[ SOUTH ], this.chunks[ SOUTH_EAST ],
                    chunks[ 0 ], chunks[ 1 ], chunks[ 2 ]
                ];
                break;
            }
            case WEST: {
                this.chunks = [
                    chunks[ 0 ], this.chunks[ NORTH_WEST ], this.chunks[ NORTH ],
                    chunks[ 1 ], this.chunks[ WEST ], this.chunks[ ORIGIN ],
                    chunks[ 2 ], this.chunks[ SOUTH_WEST ], this.chunks[ SOUTH ]
                ];
                break;
            }
        }
    }

    greet (id) {
        this.state.get('entities').add(id);
    }

    forget (id) {
        this.state.get('entities').delete(id);
    }
}

module.exports.compass = Object.freeze({
    NORTH_WEST: 0, NORTH: 1, NORTH_EAST: 2,
    WEST: 3, ORIGIN: 4, EAST: 5,
    SOUTH_WEST: 6, SOUTH: 7, SOUTH_EAST: 8
});
