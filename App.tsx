
import React, { useState, useCallback, useEffect } from 'react';
import { PlusIcon, MinusIcon, ResetIcon, CounterIcon, HistoryIcon, CheckIcon, TrashIcon } from './components/icons';

type View = 'counter' | 'history';

interface WorkoutEntry {
  id: number;
  name: string;
  count: number;
  date: string;
}

const App: React.FC = () => {
  const [count, setCount] = useState(0);
  const [incrementBy, setIncrementBy] = useState(5);
  const [workoutName, setWorkoutName] = useState('');
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [view, setView] = useState<View>('counter');
  const [showHistoryEmpty, setShowHistoryEmpty] = useState(false);


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('workoutHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('workoutHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const vibrate = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
    vibrate();
  }, [vibrate]);

  const handleDecrement = useCallback(() => {
    setCount(c => Math.max(0, c - 1));
    vibrate();
  }, [vibrate]);

  const handleReset = useCallback(() => {
    setCount(0);
    vibrate();
  }, [vibrate]);

  const handleCustomIncrement = useCallback(() => {
    setCount(c => c + incrementBy);
    vibrate();
  }, [incrementBy, vibrate]);

  const handleIncrementByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setIncrementBy(isNaN(value) ? 0 : value);
  };

  const handleFinishWorkout = useCallback(() => {
    if (count === 0) return;
    const finalName = workoutName.trim() || 'Untitled Counter';
    const newEntry: WorkoutEntry = {
      id: Date.now(),
      name: finalName,
      count: count,
      date: new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev]);
    setCount(0);
    setWorkoutName('');
    vibrate();
  }, [count, workoutName, vibrate]);
  
  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all counter logs? This action cannot be undone.')) {
        setHistory([]);
        setShowHistoryEmpty(true);
        setTimeout(() => setShowHistoryEmpty(false), 2000);
    }
  }, []);

  const handleDeleteEntry = useCallback((id: number) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);


  const renderCounter = () => (
    <>
       <header className="w-full text-center pt-4">
        <h1 className="text-2xl font-bold text-powder-blue tracking-wider">TAP COUNTER</h1>
      </header>
      <main className="flex flex-col items-center justify-center flex-grow w-full space-y-4">
        <div 
          className="font-roboto-mono text-honeydew font-bold transition-colors duration-200"
          style={{ fontSize: 'min(25vw, 10rem)' }}
        >
          {count}
        </div>
        <button
          onClick={handleIncrement}
          className="w-40 h-40 md:w-56 md:h-56 bg-powder-blue rounded-full flex items-center justify-center text-prussian-blue text-3xl font-bold shadow-lg shadow-powder-blue/20 transform transition-transform duration-150 active:scale-90 focus:outline-none focus:ring-4 focus:ring-powder-blue focus:ring-opacity-50" style={{ marginBottom: '10px' }}
        >
          TAP
        </button>
        <div className="flex items-center space-x-2 w-full max-w-xs px-4 my-6">
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Counter Name"
            className="flex-grow h-12 bg-celadon-blue/20 text-honeydew placeholder-powder-blue/60 text-center rounded-lg border border-celadon-blue p-3 focus:outline-none focus:ring-2 focus:ring-powder-blue"
          />
          <button
            onClick={handleFinishWorkout}
            disabled={count === 0}
            className="w-12 h-12 bg-celadon-blue rounded-full flex-shrink-0 flex items-center justify-center text-honeydew shadow-md transform transition-transform duration-150 active:scale-90 focus:outline-none focus:ring-4 focus:ring-celadon-blue/50 disabled:bg-gray-600 disabled:opacity-50"
            aria-label="Finish workout"
          >
            <CheckIcon />
          </button>
        </div>
      </main>
      <footer className="w-full flex flex-col items-center space-y-4 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDecrement}
            className="w-16 h-16 bg-celadon-blue rounded-full flex items-center justify-center text-honeydew shadow-md transform transition-transform duration-150 active:scale-90 focus:outline-none focus:ring-4 focus:ring-celadon-blue/50"
            aria-label="Decrease count"
          >
            <MinusIcon />
          </button>
          <button
            onClick={handleReset}
            className="w-20 h-20 bg-imperial-red rounded-full flex items-center justify-center text-honeydew shadow-md transform transition-transform duration-150 active:scale-90 focus:outline-none focus:ring-4 focus:ring-imperial-red/50"
            aria-label="Reset count"
          >
            <ResetIcon />
          </button>
          <button
            onClick={handleCustomIncrement}
            className="w-16 h-16 bg-celadon-blue rounded-full flex items-center justify-center text-honeydew shadow-md transform transition-transform duration-150 active:scale-90 focus:outline-none focus:ring-4 focus:ring-celadon-blue/50"
            aria-label={`Increase count by ${incrementBy}`}
          >
            <span className="flex items-center font-bold text-lg">
              <PlusIcon />
              {incrementBy}
            </span>
          </button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <label htmlFor="custom-increment" className="text-powder-blue text-sm">Increase by:</label>
          <input
            id="custom-increment"
            type="number"
            value={incrementBy}
            onChange={handleIncrementByChange}
            className="w-20 bg-celadon-blue/20 text-honeydew text-center rounded-md border border-celadon-blue p-2 focus:outline-none focus:ring-2 focus:ring-powder-blue"
            aria-label="Custom increment value"
          />
        </div>
      </footer>
    </>
  );

  const renderHistory = () => (
     <div className="flex flex-col h-full w-full">
        <header className="w-full text-center p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-powder-blue tracking-wider">COUNTER LOG</h1>
            <button
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className="p-2 text-powder-blue hover:text-honeydew disabled:opacity-50"
                aria-label="Clear all logs"
            >
                <TrashIcon />
            </button>
        </header>
        <main className="flex-grow w-full overflow-y-auto px-4 pb-4">
            {history.length > 0 ? (
                <ul className="space-y-3">
                    {history.map(entry => (
                        <li key={entry.id} className="bg-celadon-blue/20 rounded-lg p-4 flex justify-between items-center shadow-sm border border-celadon-blue">
                            <div className="flex-grow">
                                <p className="font-bold text-honeydew text-lg">{entry.name}</p>
                                <p className="text-sm text-powder-blue">
                                    {new Date(entry.date).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <p className="font-roboto-mono text-3xl font-bold text-powder-blue">{entry.count}</p>
                                <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="p-2 text-powder-blue/70 hover:text-honeydew"
                                    aria-label={`Delete counter ${entry.name}`}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-powder-blue opacity-80 pt-20">
                    <p>{showHistoryEmpty ? "History cleared!" : "No counters logged yet."}</p>
                    <p className="text-sm mt-2">Finish a counter on the counter screen to see it here.</p>
                </div>
            )}
        </main>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-prussian-blue text-honeydew flex flex-col justify-between items-center overflow-hidden select-none">
        <div className="flex-grow w-full flex flex-col" style={{ paddingBottom: '70px' }}>
          {view === 'counter' ? renderCounter() : renderHistory()}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-prussian-blue/80 backdrop-blur-sm border-t border-celadon-blue flex justify-around items-center">
            <button
                onClick={() => setView('counter')}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'counter' ? 'text-powder-blue' : 'text-powder-blue/60'}`}
                aria-label="Counter"
            >
                <CounterIcon />
                <span className="text-xs mt-1">Counter</span>
            </button>
            <button
                onClick={() => setView('history')}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${view === 'history' ? 'text-powder-blue' : 'text-powder-blue/60'}`}
                aria-label="History"
            >
                <HistoryIcon />
                <span className="text-xs mt-1">History</span>
            </button>
        </nav>
    </div>
  );
};

export default App;
