"use client";

import React, { useState, useEffect } from "react";

const ROWS = 20;
const COLS = 10;

type Cell = string | null;
type Board = Cell[][];

const createEmptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const TETROMINOS: Record<
  string,
  { shape: number[][]; color: string }
> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "cyan",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "orange",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "green",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "purple",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "red",
  },
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
  type: TetrominoType;
}

const getRandomTetromino = (): Piece => {
  const types = Object.keys(TETROMINOS) as TetrominoType[];
  const type = types[Math.floor(Math.random() * types.length)];
  const { shape, color } = TETROMINOS[type];
  return { shape, color, x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2), y: 0, type };
};

const rotate = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
};

const Game = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  // Check collision
  const checkCollision = (x: number, y: number, shape: number[][]): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Place piece on board
  const placePiece = (p: Piece) => {
    const newBoard = board.map(row => row.slice());
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c]) {
          const y = p.y + r;
          const x = p.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            newBoard[y][x] = p.color;
          }
        }
      }
    }
    return newBoard;
  };

  // Clear full lines
  const clearLines = (boardToClear: Board) => {
    const newBoard = boardToClear.filter(row => row.some(cell => !cell));
    const cleared = ROWS - newBoard.length;
    for (let i = 0; i < cleared; i++) {
      newBoard.unshift(Array(COLS).fill(null));
    }
    return newBoard;
  };

  // Move piece down
  const moveDown = () => {
    if (!piece) return;
    if (!checkCollision(piece.x, piece.y + 1, piece.shape)) {
      setPiece({ ...piece, y: piece.y + 1 });
    } else {
      // Lock piece and spawn new
      let newBoard = placePiece(piece);
      newBoard = clearLines(newBoard);
      setBoard(newBoard);
      const nextPiece = getRandomTetromino();
      if (checkCollision(nextPiece.x, nextPiece.y, nextPiece.shape)) {
        setGameOver(true);
        clearInterval(intervalId!);
        setIntervalId(null);
      } else {
        setPiece(nextPiece);
      }
    }
  };

  // Move piece left/right
  const moveHorizontally = (dir: number) => {
    if (!piece) return;
    const newX = piece.x + dir;
    if (!checkCollision(newX, piece.y, piece.shape)) {
      setPiece({ ...piece, x: newX });
    }
  };

  // Rotate piece
  const rotatePiece = () => {
    if (!piece) return;
    const rotatedShape = rotate(piece.shape);
    if (!checkCollision(piece.x, piece.y, rotatedShape)) {
      setPiece({ ...piece, shape: rotatedShape });
    }
  };

  // Start game
  const startGame = () => {
    setBoard(createEmptyBoard());
    setPiece(getRandomTetromino());
    setGameOver(false);

    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => {
      moveDown();
    }, 500);
    setIntervalId(id);
  };

  // Restart game
  const restartGame = () => {
    startGame();
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          moveHorizontally(-1);
          break;
        case "ArrowRight":
          moveHorizontally(1);
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowUp":
          rotatePiece();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [piece, gameOver, board]);

  // Draw board with piece on top
  const drawBoard = () => {
    let displayBoard = board.map(row => row.slice());
    if (piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const y = piece.y + r;
            const x = piece.x + c;
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
              displayBoard[y][x] = piece.color;
            }
          }
        }
      }
    }
    return displayBoard;
  };

  const displayBoard = drawBoard();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      <h1
        style={{
          fontWeight: 800,
          fontSize: 48,
          color: "#000",
          textAlign: "center",
          marginBottom: 20,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        TETRIS
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 30px)`,
          gridTemplateRows: `repeat(${ROWS}, 30px)`,
          border: "4px solid black",
          backgroundColor: "black",
          width: COLS * 30,
          height: ROWS * 30,
          boxSizing: "content-box",
        }}
      >
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              style={{
                width: 30,
                height: 30,
                border: "1px solid #222",
                backgroundColor: cell || "black",
              }}
            />
          ))
        )}
      </div>

      {gameOver && (
        <div
          style={{
            marginTop: 20,
            color: "red",
            fontWeight: "bold",
            fontSize: 24,
          }}
        >
          Game Over
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={startGame}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "white",
            border: "2px solid black",
            borderRadius: 4,
            userSelect: "none",
          }}
        >
          Start
        </button>
        <button
          onClick={restartGame}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "white",
            border: "2px solid black",
            borderRadius: 4,
            userSelect: "none",
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default Game;
