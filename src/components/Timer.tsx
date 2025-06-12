import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Volume2 } from 'lucide-react';

interface TimerProps {
  maxMinutes?: number;
}

const Timer: React.FC<TimerProps> = ({ maxMinutes = 5 }) => {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for notification sound
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Fallback if audio doesn't work
          console.log('Timer finished!');
        });
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Timer kết thúc!', {
          body: 'Thời gian nghỉ đã hết, sẵn sàng cho set tiếp theo! 💪',
          icon: '/vite.svg'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('⏰ Timer kết thúc!', {
              body: 'Thời gian nghỉ đã hết, sẵn sàng cho set tiếp theo! 💪',
              icon: '/vite.svg'
            });
          }
        });
      }
      
      // Visual alert
      alert('⏰ Timer kết thúc! Sẵn sàng cho set tiếp theo! 💪');
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = timeLeft > 0 ? formatTime(timeLeft) : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-fitness-red" />
          <span className="text-sm font-medium text-gray-700">⏱️ Timer nghỉ</span>
        </div>
        <Volume2 className="h-4 w-4 text-gray-400" />
      </div>

      {!isRunning && timeLeft === 0 && (
        <div className="flex space-x-2 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phút</label>
            <select
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fitness-red focus:border-transparent"
            >
              {Array.from({ length: maxMinutes }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Giây</label>
            <select
              value={seconds}
              onChange={(e) => setSeconds(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fitness-red focus:border-transparent"
            >
              {Array.from({ length: 60 }, (_, i) => i).map(num => (
                <option key={num} value={num}>{num.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <div className={`text-3xl font-bold transition-all duration-300 ${
          timeLeft > 0 && timeLeft <= 10 
            ? 'text-fitness-red animate-pulse scale-110' 
            : timeLeft > 0 && timeLeft <= 30
            ? 'text-orange-500'
            : 'text-fitness-black'
        }`}>
          {displayTime}
        </div>
        {timeLeft > 0 && timeLeft <= 10 && (
          <div className="text-xs text-fitness-red font-medium animate-bounce">
            🔥 Sắp hết thời gian!
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-2">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <Play className="h-3 w-3" />
            <span>Bắt đầu</span>
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <Pause className="h-3 w-3" />
            <span>Tạm dừng</span>
          </button>
        )}
        <button
          onClick={resetTimer}
          className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>
      
      {timeLeft > 0 && (
        <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-fitness-red to-red-600 transition-all duration-1000 ease-linear"
            style={{ 
              width: `${((minutes * 60 + seconds - timeLeft) / (minutes * 60 + seconds)) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Timer;