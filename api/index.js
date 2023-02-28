const Joi = require('joi'); // for request body validation
const express = require('express'); // framework used for Node.js backend
const cors = require('cors') // for allowing communication between app and api
const app = express();

app.use(express.json()); // for enabling json parsing in express
app.use(cors());

/**
 * Returns the initial state of the board as an object
 */
const initializeBoard = () => {
    return {
        configuration: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ],
        currentTurn: "X",
        turnCount: 0,
        winState: null
    }
};

/**
 * Validates the position parameter from the request body
 * @param { array } position - indices of the position in a 2D array
 */
const validatePosition = (position) => {
    const schema = Joi.object({
        position: Joi.array().items(
                Joi.number().required().valid(0, 1, 2)
            ).length(2)
    }).required().min(1);
    return schema.validate(position);
};

let board = initializeBoard();

/**
 * GET: Endpoint that initializes the state of the board and returns it to the client
 */
app.get('/', (req, res) => {
    board = initializeBoard();
    res.send(board);
});

/**
 * PUT: Endpoint that allows the client to make a turn in the app
 */
app.put('/', (req, res) => {
    const { error, value } = validatePosition(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const position = value.position;
    // check if board is playable and if turn is valid
    if (board.winState === null && board.configuration[position[0]][position[1]] === null) {
        board.configuration[position[0]][position[1]] = board.currentTurn;
        board.turnCount++;

        // check if there's a winner after 4 valid turns
        if (board.turnCount > 4) {
            // check rows
            for (let i = 0; i < 3; i++) {
                let row = board.configuration[i];
                if (row.every((val) => val === row[0]) && row[0] !== null) {
                    board.winState = board.currentTurn;
                    return res.send(board);
                }
            }

            // check columns
            for (let i = 0; i < 3; i++) {
                let col = [];
                for (let j = 0; j < 3; j++) {
                    let item = board.configuration[j][i];
                    col.push(item);
                }
                if (col.every((val) => val === col[0]) && col[0] !== null) {
                    board.winState = board.currentTurn;
                    return res.send(board);
                }
            }

            // check diagonals
            let diag1 = [board.configuration[0][0], board.configuration[1][1], board.configuration[2][2]];
            let diag2 = [board.configuration[2][0], board.configuration[1][1], board.configuration[0][2]];
            if ((diag1.every((val) => val === diag1[0]) && diag1[0] !== null) || (diag2.every((val) => val === diag2[0]) && diag2[0] !== null)) {
                board.winState = board.currentTurn;
                return res.send(board);
            }

            // if no winner at 9th turn, return a draw state
            if (board.turnCount === 9) {
                board.winState = "draw";
                return res.send(board);
            }
        }
        
        // if conditions above are not met, just update current turn and return board state to client
        if (board.currentTurn === "X") board.currentTurn = "O";
        else board.currentTurn = "X";

        return res.send(board);
    }
    else {
        // handle scenario when a player's turn is not valid
        if (board.winState === null) {
            return res.status(400).send({
                ...board,
                message: `Player ${board.currentTurn === "X" ? 1 : 2}'s turn is not valid!`
            });
        }
        // handle scenario when a board is not playable already
        else {
            return res.send({
                message: "Game over!"
            });
        }
    }
});

// make the api server listen to port 8000
app.listen(8000, () => {
    console.log(`Listening on port 8000...`);
});