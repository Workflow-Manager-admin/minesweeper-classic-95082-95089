import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import './MineSweeper.css';

// PUBLIC_INTERFACE
/**
 * The main container component for the MineSweeper game
 * 
 * @returns {JSX.Element} - The rendered MineSweeper component
 */
const MineSweeper = () => {
  // Game configuration
  const [difficulty, setDifficulty] = useState('beginner');
  const difficulties = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
  };

  // Game state
  const [board, setBoard] = useState([]);
  const [mineLocations, setMineLocations] = useState([]);
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'won', 'lost'
  const [remainingFlags, setRemainingFlags] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize the game board
  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStatus === 'playing') {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, startTime]);

  /**
   * Initializes a new game with fresh board state
   */
  const initializeGame = () => {
    const { rows, cols, mines } = difficulties[difficulty];
    
    // Create empty board
    const newBoard = Array(rows).fill().map(() => Array(cols).fill().map(() => ({
      value: 0,
      isRevealed: false,
      isFlagged: false
    })));
    
    // Place mines randomly
    const minePositions = [];
    let minesPlaced = 0;
    
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      
      // Check if there is already a mine at this position
      if (!minePositions.some(pos => pos.row === row && pos.col === col)) {
        minePositions.push({ row, col });
        newBoard[row][col].value = -1; // -1 represents a mine
        minesPlaced++;
      }
    }
    
    // Calculate values for cells (number of adjacent mines)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip mine cells
        if (newBoard[row][col].value === -1) continue;
        
        // Check all 8 adjacent cells
        let count = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            if (newBoard[r][c].value === -1) count++;
          }
        }
        
        newBoard[row][col].value = count;
      }
    }
    
    // Update state
    setBoard(newBoard);
    setMineLocations(minePositions);
    setGameStatus('ready');
    setRemainingFlags(mines);
    setStartTime(null);
    setElapsedTime(0);
  };

  /**
   * Handles a cell click to reveal it
   * 
   * @param {number} row - The row index of the clicked cell
   * @param {number} col - The column index of the clicked cell
   */
  const handleCellClick = (row, col) => {
    // Don't allow clicks if game is over or cell is flagged
    if (gameStatus === 'won' || gameStatus === 'lost' || 
        board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }
    
    // Start the game if it's the first click
    if (gameStatus === 'ready') {
      setGameStatus('playing');
      setStartTime(Date.now());
    }
    
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board));
    
    // Check if clicked on a mine
    if (newBoard[row][col].value === -1) {
      // Game over
      setGameStatus('lost');
      revealAllMines(newBoard);
      setBoard(newBoard);
      return;
    }
    
    // Reveal the clicked cell and its adjacent cells if it has zero mines around it
    revealCell(newBoard, row, col);
    
    // Check if the player has won
    checkWinCondition(newBoard);
    
    // Update the board
    setBoard(newBoard);
  };

  /**
   * Handles a cell right-click to toggle flag
   * 
   * @param {number} row - The row index of the clicked cell
   * @param {number} col - The column index of the clicked cell
   * @param {Event} e - The event object
   */
  const handleCellRightClick = (row, col, e) => {
    e.preventDefault(); // Prevent context menu
    
    // Don't allow right clicks if game is over or cell is revealed
    if (gameStatus === 'won' || gameStatus === 'lost' || board[row][col].isRevealed) {
      return;
    }
    
    // Start the game if it's the first click
    if (gameStatus === 'ready') {
      setGameStatus('playing');
      setStartTime(Date.now());
    }
    
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board));
    
    // Toggle flag
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    
    // Update the remaining flags count
    setRemainingFlags(prev => newBoard[row][col].isFlagged ? prev - 1 : prev + 1);
    
    // Update the board
    setBoard(newBoard);
  };

  /**
   * Reveals a cell and recursively reveals adjacent cells with zero mines
   * 
   * @param {Array<Array<Object>>} board - The game board
   * @param {number} row - The row index of the cell
   * @param {number} col - The column index of the cell
   */
  const revealCell = (board, row, col) => {
    // Base cases
    if (row < 0 || row >= difficulties[difficulty].rows || 
        col < 0 || col >= difficulties[difficulty].cols || 
        board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }
    
    // Reveal the cell
    board[row][col].isRevealed = true;
    
    // If it's a zero, reveal all adjacent cells
    if (board[row][col].value === 0) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r !== row || c !== col) {
            revealCell(board, r, c);
          }
        }
      }
    }
  };
  
  /**
   * Reveals all mines on the board when game is lost
   * 
   * @param {Array<Array<Object>>} board - The game board
   */
  const revealAllMines = (board) => {
    mineLocations.forEach(({ row, col }) => {
      board[row][col].isRevealed = true;
    });
  };
  
  /**
   * Checks if the player has won by revealing all non-mine cells
   * 
   * @param {Array<Array<Object>>} board - The game board
   */
  const checkWinCondition = (board) => {
    const { rows, cols, mines } = difficulties[difficulty];
    let revealedCount = 0;
    
    // Count revealed cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row][col].isRevealed) {
          revealedCount++;
        }
      }
    }
    
    // If all non-mine cells are revealed, player wins
    if (revealedCount === (rows * cols) - mines) {
      setGameStatus('won');
    }
  };
  
  /**
   * Handles changing the game difficulty
   * 
   * @param {string} newDifficulty - The new difficulty level
   */
  const handleDifficultyChange = (newDifficulty) => {
    if (difficulty !== newDifficulty) {
      setDifficulty(newDifficulty);
    }
  };
  
  /**
   * Restarts the game with a fresh board
   */
  const restartGame = () => {
    initializeGame();
  };

  return (
    <div className="minesweeper-container">
      <header className="minesweeper-header">
        <h1>MineSweeper Classic</h1>
        <div className="controls">
          <div className="difficulty-selector">
            <button 
              className={difficulty === 'beginner' ? 'active' : ''}
              onClick={() => handleDifficultyChange('beginner')}
            >
              Beginner
            </button>
            <button 
              className={difficulty === 'intermediate' ? 'active' : ''}
              onClick={() => handleDifficultyChange('intermediate')}
            >
              Intermediate
            </button>
            <button 
              className={difficulty === 'expert' ? 'active' : ''}
              onClick={() => handleDifficultyChange('expert')}
            >
              Expert
            </button>
          </div>
          <button className="restart-button" onClick={restartGame}>
            {gameStatus === 'lost' ? '😵' : gameStatus === 'won' ? '😎' : '🙂'}
          </button>
        </div>
      </header>

      <div className="game-info">
        <div className="flag-counter">🚩 {remainingFlags}</div>
        <div className="timer">⏱️ {elapsedTime}</div>
      </div>

      <div className="board-container">
        <div 
          className="board"
          style={{ 
            gridTemplateRows: `repeat(${difficulties[difficulty].rows}, 30px)`,
            gridTemplateColumns: `repeat(${difficulties[difficulty].cols}, 30px)`
          }}
        >
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={cell.value}
                isRevealed={cell.isRevealed}
                isFlagged={cell.isFlagged}
                isGameOver={gameStatus === 'lost' || gameStatus === 'won'}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(rowIndex, colIndex, e)}
              />
            ))
          ))}
        </div>
      </div>

      <div className="game-status">
        {gameStatus === 'won' && <p className="win-message">You Win! 🎉</p>}
        {gameStatus === 'lost' && <p className="lose-message">Game Over! 💥</p>}
      </div>
    </div>
  );
};

export default MineSweeper;
