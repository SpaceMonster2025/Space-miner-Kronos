
import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { StationInterface } from './components/StationInterface';
import { RetroUI } from './components/RetroUI';
import { GameState, PlayerState, MineralType, HighScore } from './types';
import { INITIAL_SHIP_CONFIG, STATION_POSITION } from './constants';

const HIGH_SCORE_KEY = 'KRONOS_HIGH_SCORES_V1';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [newHighScoreName, setNewHighScoreName] = useState('');
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    credits: 0,
    lifetimeEarnings: 0,
    totalCargoDelivered: 0,
    missionsCompleted: 0,
    currentFuel: INITIAL_SHIP_CONFIG.maxFuel,
    cargo: {
      [MineralType.IRON]: 0,
      [MineralType.COBALT]: 0,
      [MineralType.SILICON]: 0,
      [MineralType.TITANIUM]: 0,
      [MineralType.GOLD]: 0,
      [MineralType.URANIUM]: 0,
      [MineralType.KRONOS]: 0,
    },
    shipConfig: INITIAL_SHIP_CONFIG,
    position: { x: STATION_POSITION.x + 100, y: STATION_POSITION.y + 100 },
    velocity: { x: 0, y: 0 },
    rotation: -Math.PI / 2,
  });

  // Load High Scores on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        setHighScores(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load high scores", e);
    }
  }, []);

  const saveHighScores = (newScores: HighScore[]) => {
    setHighScores(newScores);
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(newScores));
  };

  const handleDock = (finalState: PlayerState) => {
    setPlayerState({
      ...finalState,
      velocity: { x: 0, y: 0 },
      position: { x: STATION_POSITION.x, y: STATION_POSITION.y } // Snap to center
    });
    setGameState(GameState.DOCKED);
  };

  const handleLaunch = () => {
    setPlayerState(prev => ({
      ...prev,
      missionsCompleted: prev.missionsCompleted + 1, // Increment missions
      position: { x: STATION_POSITION.x, y: STATION_POSITION.y + 220 },
      velocity: { x: 0, y: 1 } // Little push out
    }));
    setGameState(GameState.PLAYING);
  };

  const handleStartGame = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Error attempting to enable full-screen mode:", err);
      });
    }
    // Reset state for new game
    setPlayerState({
      credits: 0,
      lifetimeEarnings: 0,
      totalCargoDelivered: 0,
      missionsCompleted: 0,
      currentFuel: INITIAL_SHIP_CONFIG.maxFuel,
      cargo: {
        [MineralType.IRON]: 0,
        [MineralType.COBALT]: 0,
        [MineralType.SILICON]: 0,
        [MineralType.TITANIUM]: 0,
        [MineralType.GOLD]: 0,
        [MineralType.URANIUM]: 0,
        [MineralType.KRONOS]: 0,
      },
      shipConfig: INITIAL_SHIP_CONFIG,
      position: { x: STATION_POSITION.x, y: STATION_POSITION.y + 220 },
      velocity: { x: 0, y: 1 },
      rotation: -Math.PI / 2,
    });
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = () => {
    // Check if score qualifies for leaderboard
    const score = playerState.lifetimeEarnings;
    const isHighScore = highScores.length < 10 || score > highScores[highScores.length - 1].score;

    if (isHighScore) {
      setGameState(GameState.HIGHSCORE_ENTRY);
    } else {
      setGameState(GameState.GAMEOVER);
    }
  };

  const submitHighScore = () => {
    const entry: HighScore = {
      name: newHighScoreName.toUpperCase().slice(0, 3) || 'UNK',
      score: Math.floor(playerState.lifetimeEarnings),
      missions: playerState.missionsCompleted,
      cargo: playerState.totalCargoDelivered,
      date: new Date().toLocaleDateString()
    };

    const newScores = [...highScores, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    saveHighScores(newScores);
    setNewHighScoreName('');
    setGameState(GameState.GAMEOVER); // Show scoreboard
  };

  const renderLeaderboard = () => (
    <div className="w-full max-w-2xl mt-8 border border-green-800 bg-green-900/10 p-4 rounded">
      <h3 className="text-green-500 font-bold mb-2 text-center border-b border-green-800 pb-2">TOP PROSPECTORS</h3>
      <table className="w-full text-sm font-mono text-green-400">
        <thead>
          <tr className="text-green-600 text-xs">
            <th className="text-left pb-2">RANK</th>
            <th className="text-left pb-2">PILOT</th>
            <th className="text-right pb-2">SCORE</th>
            <th className="text-right pb-2">MISSIONS</th>
            <th className="text-right pb-2">CARGO</th>
          </tr>
        </thead>
        <tbody>
          {highScores.length === 0 ? (
             <tr><td colSpan={5} className="text-center py-4 text-gray-500">NO DATA FOUND</td></tr>
          ) : (
            highScores.map((s, i) => (
              <tr key={i} className="border-b border-green-900/30">
                <td className="py-1">{i + 1}</td>
                <td className="py-1 text-white">{s.name}</td>
                <td className="py-1 text-right text-yellow-500">{s.score.toLocaleString()}</td>
                <td className="py-1 text-right">{s.missions}</td>
                <td className="py-1 text-right">{s.cargo}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      <RetroUI />
      
      {/* Game Layer */}
      {(gameState === GameState.PLAYING || gameState === GameState.DOCKED) && (
        <GameCanvas 
          gameState={gameState}
          playerState={playerState} 
          onDock={handleDock}
          onGameOver={handleGameOver}
        />
      )}

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50 overflow-y-auto">
          <div className="text-center space-y-6 p-10 border-4 border-green-500 rounded shadow-[0_0_30px_#00ff00] max-w-4xl w-full my-10 bg-black">
            <h1 className="text-6xl font-bold text-green-500 font-mono retro-glow tracking-tighter">
              THE KRONOS BELT<br/>PROSPECTOR
            </h1>
            <p className="text-xl text-green-300 font-mono max-w-md mx-auto">
              Pilot your experimental Vector-Craft into the rings of Saturn. 
              Mine rare isotopes. Manage your fuel. Survive.
            </p>
            <div className="py-4">
              <p className="text-sm text-green-700">CONTROLS: WASD + MOUSE (LMB to Mine)</p>
            </div>
            <button 
              onClick={handleStartGame}
              className="px-8 py-3 bg-green-600 text-black font-bold text-2xl rounded hover:bg-green-400 transition-all hover:scale-105 shadow-[0_0_15px_#00ff00]"
            >
              INITIATE LAUNCH SEQUENCE
            </button>

            {/* Mini Leaderboard */}
            <div className="flex justify-center mt-8">
               {renderLeaderboard()}
            </div>
          </div>
        </div>
      )}

      {/* High Score Entry */}
      {gameState === GameState.HIGHSCORE_ENTRY && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50">
           <div className="text-center border-2 border-yellow-500 p-12 rounded bg-black max-w-lg w-full">
             <h2 className="text-4xl text-yellow-500 font-bold mb-4 retro-glow-amber">NEW HIGH SCORE!</h2>
             <p className="text-green-400 mb-8">SCORE: {Math.floor(playerState.lifetimeEarnings)}</p>
             <div className="mb-8">
               <label className="block text-sm text-gray-500 mb-2">ENTER INITIALS</label>
               <input 
                 autoFocus
                 maxLength={3}
                 value={newHighScoreName}
                 onChange={(e) => setNewHighScoreName(e.target.value.toUpperCase())}
                 className="bg-black border-b-4 border-green-500 text-center text-6xl text-white font-mono w-40 focus:outline-none uppercase"
               />
             </div>
             <button 
                onClick={submitHighScore}
                disabled={newHighScoreName.length === 0}
                className="bg-yellow-600 text-black font-bold px-6 py-2 rounded hover:bg-yellow-400 disabled:opacity-50"
             >
               SUBMIT RECORD
             </button>
           </div>
         </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 overflow-y-auto">
          <div className="text-center space-y-6 border border-red-500 p-12 rounded bg-black max-w-4xl w-full my-10">
            <h1 className="text-6xl font-bold text-red-600 font-mono retro-glow">SIGNAL LOST</h1>
            <p className="text-xl text-red-400 font-mono">
              Fuel reserves depleted. Life support failing.
            </p>
            
            <div className="grid grid-cols-2 gap-4 border-t border-b border-red-900 py-4 my-4">
               <div>
                  <p className="text-xs text-gray-500">FINAL SCORE</p>
                  <p className="text-2xl text-yellow-500">{Math.floor(playerState.lifetimeEarnings)}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500">MISSIONS FLOWN</p>
                  <p className="text-2xl text-green-500">{playerState.missionsCompleted}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500">ORE DELIVERED</p>
                  <p className="text-2xl text-blue-500">{playerState.totalCargoDelivered}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500">CREDITS ON HAND</p>
                  <p className="text-2xl text-gray-300">{Math.floor(playerState.credits)}</p>
               </div>
            </div>

            <div className="flex justify-center">
              {renderLeaderboard()}
            </div>

            <button 
              onClick={() => setGameState(GameState.START)}
              className="mt-8 px-8 py-3 border border-red-500 text-red-500 font-bold text-xl rounded hover:bg-red-600 hover:text-black transition-all"
            >
              RETURN TO TITLE
            </button>
          </div>
        </div>
      )}

      {/* Docking Interface */}
      {gameState === GameState.DOCKED && (
        <StationInterface 
          playerState={playerState} 
          setPlayerState={setPlayerState} 
          onLaunch={handleLaunch} 
        />
      )}
    </div>
  );
};

export default App;
