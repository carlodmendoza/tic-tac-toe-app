import './App.css';
import React, { useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import api from './Endpoints' 

// custom styles used in the components
const useStyles = makeStyles(() => ({
	startScreen: {
		margin: "300px auto"
	},
	startButton: {
		width: "300px",
		height: "50px",
		fontSize: "20px",
		marginTop: "50px"
	},
	boardTitle: {
		marginBottom: "50px"
	},
	boardGrid: {
		margin: "150px auto"
	},
	boardCell: {
		height: "100px",
		width: "100px",
		borderRadius: "0px",
		fontSize: "100px"
	},
	boardText: {
		marginTop: "50px"
	},
	verticalBorderRight: {
		borderRight: "solid 3px black"
	},
	horizontalBorderRight: {
		borderBottom: "solid 3px black"
	},
	player1Color: {
		color: "#CC0000",
		"&:disabled": {
            color: "#CC0000"
        }
	},
	player2Color: {
		color: "#3333FF",
		"&:disabled": {
            color: "#3333FF"
        }
	},
	drawColor: {
		color: "#FFBF00"
	}
}));

function App() {
	const classes = useStyles();
	const [boardConfiguration, setBoardConfiguration] = useState([
		[null, null, null],
		[null, null, null],
		[null, null, null],
	]);
	const [currentTurn, setCurrentTurn] = useState("X");
	const [winState, setWinState] = useState(null);
	const [gameStart, setGameStart] = useState(false);

	/**
	 * Returns the row component of the board
	 * @prop { number } row - row number for indexing
	 */
	const FormRow = (props) => {
		return (
			<React.Fragment>
    			<Grid item>
        			<Button 
						className={`${classes.boardCell} ${classes.verticalBorderRight} ${props.row === 0 || props.row === 1 ? classes.horizontalBorderRight : "" } ${boardConfiguration[props.row][0] === "X" ? classes.player1Color : classes.player2Color}`}
						onClick={() => makeTurn([props.row, 0])}
						disabled={boardConfiguration[props.row][0] !== null || !gameStart}
					>{boardConfiguration[props.row][0]}</Button>
        		</Grid>
				<Grid item>
					<Button 
						className={`${classes.boardCell} ${classes.verticalBorderRight} ${props.row === 0 || props.row === 1 ? classes.horizontalBorderRight : "" } ${boardConfiguration[props.row][1] === "X" ? classes.player1Color : classes.player2Color}`}
						onClick={() => makeTurn([props.row, 1])}
						disabled={boardConfiguration[props.row][1] !== null || !gameStart}
					>{boardConfiguration[props.row][1]}</Button>
				</Grid>
				<Grid item>
					<Button 
						className={`${classes.boardCell} ${props.row === 0 || props.row === 1 ? classes.horizontalBorderRight : "" } ${boardConfiguration[props.row][2] === "X" ? classes.player1Color : classes.player2Color}`}
						onClick={() => makeTurn([props.row, 2])}
						disabled={boardConfiguration[props.row][2] !== null  || !gameStart}
					>{boardConfiguration[props.row][2]}</Button>
				</Grid>
      		</React.Fragment>
    	);
  	};

	/**
	 * API call for initialization of the game
	 */
	const startGame = async() => {
		try {
			let response = await api.getBoard();
			setBoardConfiguration(response.data.configuration);
			setCurrentTurn(response.data.currentTurn);
			setWinState(response.data.winState);

			setGameStart(true);
		}
		catch(err) {
			console.log(err);
		}
	}

	/**
	 * API call for making turns in the game
	 * @prop { array } position - indices of the turn position in a 2D array
	 */
	const makeTurn = async(position) => {
		try {
			let body = {
				"position": position
			}
			let response = await api.updateBoard(body);
			if (response.data.winState === null) {
				setBoardConfiguration(response.data.configuration);
				setCurrentTurn(response.data.currentTurn);
			}
			else {
				setBoardConfiguration(response.data.configuration);
				if (response.data.winState === "draw") setWinState("draw");
				else setWinState(response.data.currentTurn);
				setGameStart(false);
			}
		}
		catch(err) {
			console.log(err);
		}
	}

	return (
    	<div className="App">
			<div >{
				!gameStart && winState === null ?
				<div className={classes.startScreen}>
					<Typography variant="h1">TIC-TAC-TOE</Typography>
					<Button
						className={classes.startButton}
						variant="contained"
						onClick={startGame}
					>
					Start Game
					</Button>
				</div>
				:
				<div className={classes.boardGrid}>
					<Typography className={classes.boardTitle} variant="h3">TIC-TAC-TOE</Typography>
					<Grid container>
						<Grid container item xs={12} justifyContent={"center"}>
							<FormRow row={0}/>
						</Grid>
						<Grid container item xs={12} justifyContent={"center"}>
							<FormRow row={1}/>
						</Grid>
						<Grid container item xs={12} justifyContent={"center"}>
							<FormRow row={2}/>
						</Grid>
					</Grid>
					{
						winState === null ?
						<Typography className={`${classes.boardText} ${currentTurn === "X" ? classes.player1Color : classes.player2Color}`} variant="h6">{currentTurn === "X" ? "Waiting for Player 1's turn..." : "Waiting for Player 2's turn..."}</Typography>
						:
						<>
							<Typography className={`${classes.boardText} ${winState === "X" ? classes.player1Color : winState === "O" ? classes.player2Color : classes.drawColor}`} variant="h4">{winState === "X" ? "Player 1 Won!" : winState === "O" ? "Player 2 Won!" : "Draw!"}</Typography>
							<Button
								className={classes.startButton}
								variant="contained"
								onClick={startGame}
							>
								Start New Game
							</Button>
						</>
					}
				</div>
				}
			</div>
    	</div>
  	);
}

export default App;