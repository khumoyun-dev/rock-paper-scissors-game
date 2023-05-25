const crypto = require('crypto');

class Main {
    constructor(moves) {
        this.moves = moves;
        this.key = this.generateKey();
        this.computerMove = this.getComputerMove();
    }

    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    getComputerMove() {
        const randomIndex = Math.floor(Math.random() * this.moves.length);
        return this.moves[randomIndex];
    }

    calculateHMAC(move) {
        const hmac = crypto.createHmac('sha256', this.key);
        hmac.update(move);
        return hmac.digest('hex');
    }

    displayMenu() {
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');
    }

    getUserMove() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('Enter your move: ', (input) => {
                rl.close();
                resolve(input);
            });
        });
    }

    determineWinner(userMove) {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(this.computerMove);

        if (userIndex === -1) {
            console.log('Invalid move. Please try again.');
            return;
        }

        const halfLength = Math.floor(this.moves.length / 2);

        if (userIndex === computerIndex) {
            console.log('It\'s a draw!');
        } else if (
            (userIndex < computerIndex && computerIndex <= userIndex + halfLength) ||
            (userIndex > computerIndex && computerIndex <= userIndex + halfLength - this.moves.length)
        ) {
            console.log(`You lose! Computer move: ${this.computerMove}`);
        } else {
            console.log(`You win! Computer move: ${this.computerMove}`);
        }

        console.log(`HMAC key: ${this.key}`);
    }

    playGame() {
        console.log(`HMAC: ${this.calculateHMAC(this.computerMove)}`);
        this.displayMenu();

        this.getUserMove().then((userMove) => {
            if (userMove === '0') {
                console.log('Exiting the game...');
                return;
            } else if (userMove === '?') {
                this.displayHelpTable();
            } else {
                console.log(`Your move: ${this.moves[userMove - 1]}`);
                this.determineWinner(this.moves[userMove - 1]);
            }
        });
    }

    determineResult(moveIndex, otherMoveIndex, movesLength) {
        const halfLength = Math.floor(movesLength / 2);
        if (
            (moveIndex < otherMoveIndex && otherMoveIndex <= moveIndex + halfLength) ||
            (moveIndex > otherMoveIndex && otherMoveIndex <= moveIndex + halfLength - movesLength)
        ) {
            return 'win';
        } else {
            return 'lose';
        }
    }

    displayHelpTable() {
        let data = [
            ['Moves', ...moves],
            ...moves.map((move) => {
                const row = [move];
                moves.forEach((otherMove) => {
                    if (move === otherMove) {
                        row.push('draw');
                    } else {
                        const moveIndex = moves.indexOf(move);
                        const otherMoveIndex = moves.indexOf(otherMove);
                        const result = this.determineResult(moveIndex, otherMoveIndex, moves.length);
                        row.push(result);
                    }
                });
                return row;
            })
        ];


        const columnLengths = data.reduce((lengths, row) => {
            row.forEach((cell, columnIndex) => {
                lengths[columnIndex] = Math.max(lengths[columnIndex] || 0, cell.toString().length);
            });
            return lengths;
        }, []);


        const horizontalSeparator = `+${columnLengths.map(length => '-'.repeat(length + 2)).join('+')}+`;


        console.log(horizontalSeparator);
        data.forEach(row => {
            const cells = row.map((cell, columnIndex) => ` ${cell.toString().padEnd(columnLengths[columnIndex])} `);
            console.log(`|${cells.join('|')}|`);
            console.log(horizontalSeparator);
        });
    }
}

const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size !== moves.length) {
    console.log('Invalid arguments. Please provide an odd number of non-repeating moves.');
    console.log('Example: node script.js rock paper scissors');
} else {
    const game = new Main(moves);
    game.playGame();
}
