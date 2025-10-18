import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Home, Settings, ChevronRight, Check } from 'lucide-react';

const ALGORITHMS = [
  { id: 'bfs', name: 'Breadth-First Search', category: 'Graph Traversal', complexity: 'O(V+E)' },
  { id: 'dfs', name: 'Depth-First Search', category: 'Graph Traversal', complexity: 'O(V+E)' },
  { id: 'dijkstra', name: 'Dijkstra\'s Algorithm', category: 'Shortest Path', complexity: 'O(V²)' },
  { id: 'astar', name: 'A* Search', category: 'Shortest Path', complexity: 'O(b^d)' },
  { id: 'bubble', name: 'Bubble Sort', category: 'Sorting', complexity: 'O(n²)' },
  { id: 'quick', name: 'Quick Sort', category: 'Sorting', complexity: 'O(n log n)' },
  { id: 'merge', name: 'Merge Sort', category: 'Sorting', complexity: 'O(n log n)' },
  { id: 'heap', name: 'Heap Sort', category: 'Sorting', complexity: 'O(n log n)' },
  { id: 'insertion', name: 'Insertion Sort', category: 'Sorting', complexity: 'O(n²)' },
  { id: 'binary', name: 'Binary Search', category: 'Searching', complexity: 'O(log n)' },
  { id: 'linear', name: 'Linear Search', category: 'Searching', complexity: 'O(n)' },
  { id: 'jump', name: 'Jump Search', category: 'Searching', complexity: 'O(√n)' },
];

const MazeGame = ({ algorithm, onComplete, gridSize }) => {
  const [grid, setGrid] = useState([]);
  const [visited, setVisited] = useState(new Set());
  const [current, setCurrent] = useState(null);
  const [found, setFound] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  
  const queueRef = useRef([]);
  const stackRef = useRef([]);
  const intervalRef = useRef(null);
  const visitedRef = useRef(new Set());

  const end = { x: gridSize - 1, y: gridSize - 1 };

  useEffect(() => {
    initializeGrid();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [algorithm, gridSize]);

  const initializeGrid = () => {
    const newGrid = Array(gridSize).fill(null).map((_, y) => 
      Array(gridSize).fill(null).map((_, x) => ({
        x, y,
        isWall: Math.random() < 0.25 && !(x === 0 && y === 0) && !(x === gridSize - 1 && y === gridSize - 1)
      }))
    );
    setGrid(newGrid);
    setCurrent({ x: 0, y: 0 });
    setVisited(new Set(['0,0']));
    setFound(false);
    setIsRunning(false);
    visitedRef.current = new Set(['0,0']);
    queueRef.current = [{ x: 0, y: 0 }];
    stackRef.current = [{ x: 0, y: 0 }];
  };

  const getNeighbors = (pos) => {
    const neighbors = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    for (const [dx, dy] of directions) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;
      const key = `${newX},${newY}`;
      
      if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && 
          !grid[newY][newX].isWall && !visitedRef.current.has(key)) {
        neighbors.push({ x: newX, y: newY });
      }
    }
    return neighbors;
  };

  const step = () => {
    const queue = queueRef.current;
    const stack = stackRef.current;
    
    if ((algorithm === 'bfs' || algorithm === 'dijkstra' || algorithm === 'astar') && queue.length === 0) {
      setIsRunning(false);
      return;
    }
    
    if (algorithm === 'dfs' && stack.length === 0) {
      setIsRunning(false);
      return;
    }

    const curr = algorithm === 'dfs' ? stack.pop() : queue.shift();
    const key = `${curr.x},${curr.y}`;

    if (visitedRef.current.has(key)) return;

    visitedRef.current.add(key);
    setVisited(new Set(visitedRef.current));
    setCurrent(curr);

    if (curr.x === end.x && curr.y === end.y) {
      setFound(true);
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete();
      return;
    }

    const neighbors = getNeighbors(curr);
    
    if (algorithm === 'dfs') {
      stackRef.current.push(...neighbors.reverse());
    } else {
      queueRef.current.push(...neighbors);
    }
  };

  useEffect(() => {
    if (isRunning && !found) {
      intervalRef.current = setInterval(step, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, found, speed]);

  const toggleRunning = () => setIsRunning(!isRunning);
  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    initializeGrid();
  };

  const cellSize = gridSize <= 15 ? 40 : gridSize <= 25 ? 28 : 20;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button onClick={toggleRunning} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 font-medium">
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button onClick={reset} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2 font-medium">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <span>Speed:</span>
            <input type="range" min="10" max="500" value={501 - speed} onChange={(e) => setSpeed(501 - Number(e.target.value))} className="w-32" />
          </label>
          {found && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Path found - {visited.size} cells visited</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-md p-4 bg-white overflow-auto max-h-[600px]">
        <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}>
          {grid.map((row, y) => 
            row.map((cell, x) => {
              const key = `${x},${y}`;
              let bgColor = 'bg-white';
              if (cell.isWall) bgColor = 'bg-gray-800';
              else if (x === 0 && y === 0) bgColor = 'bg-green-500';
              else if (x === end.x && y === end.y) bgColor = 'bg-red-500';
              else if (current?.x === x && current?.y === y) bgColor = 'bg-blue-500';
              else if (visited.has(key)) bgColor = 'bg-blue-100';

              return <div key={key} className={`${bgColor} border border-gray-100`} style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />;
            })
          )}
        </div>
      </div>
      
      <div className="flex space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-green-500 border border-gray-300"></div><span>Start</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-red-500 border border-gray-300"></div><span>End</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-800 border border-gray-300"></div><span>Wall</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-100 border border-gray-300"></div><span>Visited</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-500 border border-gray-300"></div><span>Current</span></div>
      </div>
    </div>
  );
};

const SortingGame = ({ algorithm, onComplete, arraySize }) => {
  const [array, setArray] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(50);
  
  const stepsRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeArray();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [algorithm, arraySize]);

  const initializeArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
    setArray(newArray);
    setComparing([]);
    setSorted([]);
    setCurrentStep(0);
    setIsRunning(false);
    stepsRef.current = generateSteps(newArray);
  };

  const generateSteps = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    
    if (algorithm === 'bubble') {
      for (let i = 0; i < tempArr.length; i++) {
        for (let j = 0; j < tempArr.length - i - 1; j++) {
          steps.push({ array: [...tempArr], comparing: [j, j + 1], sorted: [] });
          if (tempArr[j] > tempArr[j + 1]) {
            [tempArr[j], tempArr[j + 1]] = [tempArr[j + 1], tempArr[j]];
            steps.push({ array: [...tempArr], comparing: [j, j + 1], sorted: [] });
          }
        }
      }
    } else if (algorithm === 'insertion') {
      for (let i = 1; i < tempArr.length; i++) {
        const key = tempArr[i];
        let j = i - 1;
        while (j >= 0 && tempArr[j] > key) {
          steps.push({ array: [...tempArr], comparing: [j, j + 1], sorted: [] });
          tempArr[j + 1] = tempArr[j];
          j--;
        }
        tempArr[j + 1] = key;
      }
    } else if (algorithm === 'quick') {
      quickSort(tempArr, 0, tempArr.length - 1, steps);
    } else if (algorithm === 'merge') {
      mergeSort(tempArr, 0, tempArr.length - 1, steps);
    } else if (algorithm === 'heap') {
      heapSort(tempArr, steps);
    }
    
    steps.push({ array: [...tempArr], comparing: [], sorted: Array.from({ length: tempArr.length }, (_, i) => i) });
    return steps;
  };

  const quickSort = (arr, low, high, steps) => {
    if (low < high) {
      const pi = partition(arr, low, high, steps);
      quickSort(arr, low, pi - 1, steps);
      quickSort(arr, pi + 1, high, steps);
    }
  };

  const partition = (arr, low, high, steps) => {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparing: [j, high], sorted: [] });
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  };

  const mergeSort = (arr, left, right, steps) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSort(arr, left, mid, steps);
      mergeSort(arr, mid + 1, right, steps);
      merge(arr, left, mid, right, steps);
    }
  };

  const merge = (arr, left, mid, right, steps) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      steps.push({ array: [...arr], comparing: [left + i, mid + 1 + j], sorted: [] });
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
    }
    while (i < leftArr.length) { arr[k] = leftArr[i]; i++; k++; }
    while (j < rightArr.length) { arr[k] = rightArr[j]; j++; k++; }
  };

  const heapSort = (arr, steps) => {
    const n = arr.length;
    
    const heapify = (n, i) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && arr[left] > arr[largest]) largest = left;
      if (right < n && arr[right] > arr[largest]) largest = right;
      if (largest !== i) {
        steps.push({ array: [...arr], comparing: [i, largest], sorted: [] });
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(n, largest);
      }
    };
    
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      heapify(i, 0);
    }
  };

  useEffect(() => {
    if (isRunning && currentStep < stepsRef.current.length) {
      intervalRef.current = setInterval(() => {
        const step = stepsRef.current[currentStep];
        setArray(step.array);
        setComparing(step.comparing);
        setSorted(step.sorted);
        setCurrentStep(prev => {
          if (prev >= stepsRef.current.length - 1) {
            setIsRunning(false);
            onComplete();
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentStep, speed]);

  const toggleRunning = () => setIsRunning(!isRunning);
  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    initializeArray();
  };

  const barWidth = arraySize <= 20 ? 32 : arraySize <= 50 ? 16 : 8;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button onClick={toggleRunning} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 font-medium">
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button onClick={reset} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2 font-medium">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <span>Speed:</span>
            <input type="range" min="10" max="200" value={210 - speed} onChange={(e) => setSpeed(210 - Number(e.target.value))} className="w-32" />
          </label>
          {currentStep >= stepsRef.current.length - 1 && stepsRef.current.length > 0 && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Sorted in {stepsRef.current.length} operations</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-md p-6 bg-white overflow-auto">
        <div className="flex items-end justify-center space-x-1 h-80">
          {array.map((value, idx) => {
            let bgColor = 'bg-gray-400';
            if (comparing.includes(idx)) bgColor = 'bg-blue-500';
            if (sorted.includes(idx)) bgColor = 'bg-green-500';
            
            return (
              <div key={idx} className={`${bgColor} transition-all duration-100 flex items-end justify-center`} style={{ width: `${barWidth}px`, height: `${value * 3}px` }}>
                {arraySize <= 30 && <span className="text-xs text-white font-medium">{value}</span>}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-400"></div><span>Unsorted</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-500"></div><span>Comparing</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-green-500"></div><span>Sorted</span></div>
      </div>
    </div>
  );
};

const SearchGame = ({ algorithm, onComplete, arraySize }) => {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(null);
  const [current, setCurrent] = useState(-1);
  const [found, setFound] = useState(false);
  const [checked, setChecked] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  
  const lowRef = useRef(0);
  const highRef = useRef(0);
  const currentRef = useRef(-1);
  const jumpSizeRef = useRef(0);
  const intervalRef = useRef(null);
  const checkedRef = useRef([]);

  useEffect(() => {
    initializeArray();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [algorithm, arraySize]);

  const initializeArray = () => {
    const sorted = Array.from({ length: arraySize }, (_, i) => (i + 1) * 5);
    setArray(sorted);
    const randomTarget = sorted[Math.floor(Math.random() * sorted.length)];
    setTarget(randomTarget);
    setCurrent(-1);
    setFound(false);
    setChecked([]);
    setIsRunning(false);
    lowRef.current = 0;
    highRef.current = sorted.length - 1;
    currentRef.current = -1;
    jumpSizeRef.current = Math.floor(Math.sqrt(sorted.length));
    checkedRef.current = [];
  };

  const step = () => {
    if (algorithm === 'linear') {
      if (currentRef.current >= array.length - 1 || found) {
        setIsRunning(false);
        return;
      }
      currentRef.current++;
      checkedRef.current.push(currentRef.current);
      setCurrent(currentRef.current);
      setChecked([...checkedRef.current]);
      
      if (array[currentRef.current] === target) {
        setFound(true);
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete();
      }
    } else if (algorithm === 'binary') {
      if (lowRef.current > highRef.current || found) {
        setIsRunning(false);
        return;
      }
      const mid = Math.floor((lowRef.current + highRef.current) / 2);
      currentRef.current = mid;
      checkedRef.current.push(mid);
      setCurrent(mid);
      setChecked([...checkedRef.current]);
      
      if (array[mid] === target) {
        setFound(true);
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete();
      } else if (array[mid] < target) {
        lowRef.current = mid + 1;
      } else {
        highRef.current = mid - 1;
      }
    } else if (algorithm === 'jump') {
      if (currentRef.current >= array.length || found) {
        setIsRunning(false);
        return;
      }
      
      if (currentRef.current === -1) {
        currentRef.current = 0;
      } else {
        currentRef.current = Math.min(currentRef.current + jumpSizeRef.current, array.length - 1);
      }
      
      checkedRef.current.push(currentRef.current);
      setCurrent(currentRef.current);
      setChecked([...checkedRef.current]);
      
      if (array[currentRef.current] === target) {
        setFound(true);
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete();
      } else if (array[currentRef.current] > target) {
        // Linear search back
        let linearIdx = currentRef.current - jumpSizeRef.current;
        while (linearIdx < currentRef.current) {
          if (array[linearIdx] === target) {
            currentRef.current = linearIdx;
            checkedRef.current.push(linearIdx);
            setCurrent(linearIdx);
            setChecked([...checkedRef.current]);
            setFound(true);
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete();
            return;
          }
          linearIdx++;
        }
        setIsRunning(false);
      }
    }
  };

  useEffect(() => {
    if (isRunning && !found) {
      intervalRef.current = setInterval(step, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, found, speed]);

  const toggleRunning = () => setIsRunning(!isRunning);
  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    initializeArray();
  };

  const cellWidth = arraySize <= 20 ? 48 : arraySize <= 40 ? 32 : 24;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button onClick={toggleRunning} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 font-medium">
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button onClick={reset} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2 font-medium">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">Target: <span className="font-mono font-bold text-lg text-red-600">{target}</span></div>
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <span>Speed:</span>
            <input type="range" min="100" max="1000" value={1100 - speed} onChange={(e) => setSpeed(1100 - Number(e.target.value))} className="w-32" />
          </label>
          {found && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Found at index {current} - {checked.length} checks</span>
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-md p-6 bg-white overflow-auto">
        <div className="flex items-center space-x-1 justify-center">
          {array.map((value, idx) => {
            let bgColor = 'bg-gray-100';
            if (idx === current) bgColor = found ? 'bg-green-500' : 'bg-blue-500';
            else if (checked.includes(idx)) bgColor = 'bg-blue-100';
            
            let textColor = 'text-gray-700';
            if (idx === current) textColor = 'text-white';
            
            return (
              <div key={idx} className={`${bgColor} ${textColor} flex items-center justify-center border border-gray-300 font-mono font-semibold transition-all duration-200`} style={{ width: `${cellWidth}px`, height: `${cellWidth}px` }}>
                {arraySize <= 30 && value}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-100 border border-gray-300"></div><span>Unchecked</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-100 border border-gray-300"></div><span>Checked</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-500 border border-gray-300"></div><span>Current</span></div>
        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-green-500 border border-gray-300"></div><span>Found</span></div>
      </div>
    </div>
  );
};

export default function AlgorithmVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [completedAlgorithms, setCompletedAlgorithms] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [gridSize, setGridSize] = useState(15);
  const [arraySize, setArraySize] = useState(30);

  const handleComplete = () => {
    setCompletedAlgorithms(new Set([...completedAlgorithms, selectedAlgorithm.id]));
  };

  const renderGame = () => {
    if (!selectedAlgorithm) return null;

    if (['bfs', 'dfs', 'dijkstra', 'astar'].includes(selectedAlgorithm.id)) {
      return <MazeGame algorithm={selectedAlgorithm.id} onComplete={handleComplete} gridSize={gridSize} />;
    }

    if (['bubble', 'quick', 'merge', 'heap', 'insertion'].includes(selectedAlgorithm.id)) {
      return <SortingGame algorithm={selectedAlgorithm.id} onComplete={handleComplete} arraySize={arraySize} />;
    }

    if (['binary', 'linear', 'jump'].includes(selectedAlgorithm.id)) {
      return <SearchGame algorithm={selectedAlgorithm.id} onComplete={handleComplete} arraySize={arraySize} />;
    }
  };

  if (!selectedAlgorithm) {
    const categories = [...new Set(ALGORITHMS.map(a => a.category))];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Algorithm Visualizer</h1>
                <p className="text-sm text-gray-600 mt-1">Interactive algorithm learning platform</p>
              </div>
              <button onClick={() => setShowSettings(!showSettings)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grid Size (Graph Algorithms): {gridSize}x{gridSize}</label>
                  <input type="range" min="10" max="40" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Array Size (Sorting/Search): {arraySize} elements</label>
                  <input type="range" min="10" max="100" value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {categories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALGORITHMS.filter(a => a.category === category).map(algo => {
                  const isCompleted = completedAlgorithms.has(algo.id);
                  
                  return (
                    <button key={algo.id} onClick={() => setSelectedAlgorithm(algo)} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{algo.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 font-mono">{algo.complexity}</p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          {isCompleted && (
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              This platform provides interactive visualizations of fundamental algorithms in computer science. 
              Each algorithm is presented as an interactive demonstration where you can control the execution speed 
              and customize parameters. Complete all algorithms to master the fundamentals of algorithmic thinking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedAlgorithm(null)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
              <Home className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{selectedAlgorithm.category}</div>
              <h2 className="text-xl font-bold text-gray-900">{selectedAlgorithm.name}</h2>
              <div className="text-xs text-gray-500 font-mono mt-1">{selectedAlgorithm.complexity}</div>
            </div>

            <div className="w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderGame()}
      </div>
    </div>
  );
}
