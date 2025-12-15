import { useState, useEffect, useCallback, useRef } from 'react';
import { Rocket, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Asteroid {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
}

interface RocketGameProps {
  progress: number;
  stage: string;
}

export default function RocketGame({ progress, stage }: RocketGameProps) {
  const [rocketPos, setRocketPos] = useState({ x: 50, y: 70 });
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const asteroidIdRef = useRef(0);

  const difficultyLevel = Math.floor(score / 50);
  const spawnRate = Math.max(400, 1200 - difficultyLevel * 100);
  const baseSpeed = 1 + difficultyLevel * 0.3;
  const maxSpeed = 2.5 + difficultyLevel * 0.4;
  const baseSize = 15 + Math.min(difficultyLevel * 2, 10);
  const maxSizeBonus = 20 + Math.min(difficultyLevel * 3, 15);

  const resetGame = () => {
    setRocketPos({ x: 50, y: 70 });
    setAsteroids([]);
    setLives(3);
    setGameOver(false);
    setScore(0);
    setIsInvulnerable(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      keysPressed.current.add(e.key);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameOver) return;

    const moveInterval = setInterval(() => {
      const speed = 3;
      setRocketPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current.has('ArrowLeft')) newX = Math.max(5, prev.x - speed);
        if (keysPressed.current.has('ArrowRight')) newX = Math.min(95, prev.x + speed);
        if (keysPressed.current.has('ArrowUp')) newY = Math.max(10, prev.y - speed);
        if (keysPressed.current.has('ArrowDown')) newY = Math.min(90, prev.y + speed);

        return { x: newX, y: newY };
      });
    }, 30);

    return () => clearInterval(moveInterval);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      const newAsteroid: Asteroid = {
        id: asteroidIdRef.current++,
        x: Math.random() * 90 + 5,
        y: -10,
        size: Math.random() * maxSizeBonus + baseSize,
        speed: Math.random() * (maxSpeed - baseSpeed) + baseSpeed,
        rotation: Math.random() * 360,
      };
      setAsteroids(prev => [...prev, newAsteroid]);
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameOver, spawnRate, baseSpeed, maxSpeed, baseSize, maxSizeBonus]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setAsteroids(prev => {
        const updated = prev
          .map(a => ({
            ...a,
            y: a.y + a.speed,
            rotation: a.rotation + 2,
          }))
          .filter(a => a.y < 110);

        const avoided = prev.filter(a => a.y >= 100).length;
        if (avoided > 0) {
          setScore(s => s + avoided * 10);
        }

        return updated;
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || isInvulnerable) return;

    const rocketRadius = 20;
    const collision = asteroids.some(asteroid => {
      const asteroidRadius = asteroid.size / 2;
      const dx = rocketPos.x - asteroid.x;
      const dy = rocketPos.y - asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (rocketRadius + asteroidRadius) / 3;
    });

    if (collision) {
      setIsInvulnerable(true);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });

      setTimeout(() => setIsInvulnerable(false), 1500);
    }
  }, [asteroids, rocketPos, gameOver, isInvulnerable]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              size={20}
              className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {difficultyLevel > 0 && (
            <span className="text-orange-400 text-xs font-medium">
              LVL {difficultyLevel}
            </span>
          )}
          <span className="text-[#06D6A0] font-mono text-sm">
            {score}
          </span>
        </div>
      </div>

      <div
        ref={gameAreaRef}
        className="relative w-full h-48 bg-gradient-to-b from-[#0A192F] to-[#1a2f4a] rounded-xl overflow-hidden border border-white/10"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      >
        {asteroids.map(asteroid => (
          <motion.div
            key={asteroid.id}
            className="absolute"
            style={{
              left: `${asteroid.x}%`,
              top: `${asteroid.y}%`,
              width: asteroid.size,
              height: asteroid.size,
              transform: `translate(-50%, -50%) rotate(${asteroid.rotation}deg)`,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full text-gray-500 fill-gray-600">
              <polygon points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8" />
            </svg>
          </motion.div>
        ))}

        <motion.div
          className="absolute"
          style={{
            left: `${rocketPos.x}%`,
            top: `${rocketPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: isInvulnerable ? [1, 0.3, 1] : 1,
          }}
          transition={{
            duration: 0.2,
            repeat: isInvulnerable ? Infinity : 0,
          }}
        >
          <div className="relative">
            <motion.div
              animate={{ scaleY: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.15, repeat: Infinity }}
              className="absolute top-8 left-1/2 -translate-x-1/2 w-3 h-5"
              style={{
                background: 'linear-gradient(to bottom, #FF6B35 0%, #FFD700 50%, transparent 100%)',
                borderRadius: '0 0 50% 50%',
                filter: 'blur(2px)',
              }}
            />
            <div className="w-10 h-10 bg-gradient-to-br from-[#2979FF] to-[#06D6A0] rounded-xl flex items-center justify-center shadow-lg">
              <Rocket className="text-white" size={20} />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
            >
              <p className="text-white font-bold text-lg mb-2">Game Over!</p>
              <p className="text-gray-400 text-sm mb-3">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-medium hover:bg-[#2979FF]/80 transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!gameOver && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs">
            Use arrow keys to dodge asteroids
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{stage}</span>
          <span className="text-[#2979FF] font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2979FF] to-[#06D6A0]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}