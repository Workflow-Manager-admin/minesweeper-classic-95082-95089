import React from 'react';
import './Cell.css';

// PUBLIC_INTERFACE
/**
 * Component representing a single cell in the MineSweeper grid
 * 
 * @param {Object} props - Component properties
 * @param {number} props.value - The value of the cell (number of adjacent mines, or -1 for mine)
 * @param {boolean} props.isRevealed - Whether the cell has been revealed
 * @param {boolean} props.isFlagged - Whether the cell is flagged
 * @param {boolean} props.isGameOver - Whether the game is over
 * @param {Function} props.onClick - Function to handle left click (reveal)
 * @param {Function} props.onContextMenu - Function to handle right click (flag)
 * @returns {JSX.Element} - The rendered Cell component
 */
const Cell = ({ value, isRevealed, isFlagged, isGameOver, onClick, onContextMenu }) => {
  // Determine display value and className
  let displayValue = '';
  let cellClass = 'cell';

  if (isRevealed) {
    cellClass += ' revealed';
    
    if (value === -1) {
      // It's a mine
      displayValue = '💣';
      cellClass += ' mine';
    } else if (value > 0) {
      // It's a number
      displayValue = value;
      cellClass += ` value-${value}`;
    }
  } else if (isFlagged) {
    displayValue = '🚩';
    cellClass += ' flagged';
  }

  if (isGameOver && value === -1 && !isFlagged) {
    // Show all mines when game is over
    displayValue = '💣';
    cellClass += ' revealed mine';
  }

  return (
    <div 
      className={cellClass}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {displayValue}
    </div>
  );
};

export default Cell;
