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
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: gridSize - 1, y: gridSize - 1 });
  const [current, setCurrent] = useState(null);
  const [visited, setVisited] = useState(new Set());
  const [path, setPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [found, setFound] = useState(false);
  const [queue, setQueue] = useState([]);
  const [stack, setStack] = useState([]);
  const [speed, setSpeed] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeGrid();
  }, [algorithm, gridSize]);

  const initializeGrid = () => {
    const newGrid = Array(gridSize).fill(null).map((_, y) => 
      Array(gridSize).fill(null).map((_, x) => ({
        x, y,
        isWall: Math.random() < 0.25 && !(x === 0 && y === 0) && !(x === gridSize - 1 && y === gridSize - 1),
        isStart: x === 0 && y === 0,
        isEnd: x === gridSize - 1 && y === gridSize - 1,
      }))
    );
    setGrid(newGrid);
    setCurrent(start);
    setVisited(new Set());
    setPath([]);
    setFound(false);
    setQueue([start]);
    setStack([start]);
  };

  const getNeighbors = (pos) => {
    const neighbors = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    for (const [dx, dy] of directions) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;
      
      if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        const cell = grid[newY][newX];
        if (!cell.isWall && !visited.has(`${newX},${newY}`)) {
          neighbors.push({ x: newX, y: newY });
        }
      }
    }
    return neighbors;
  };

  const stepBFS = () => {
    if (queue.length === 0 || found) {
      setIsRunning(false);
      return;
    }

    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) return;

    const newVisited = new Set(visited);
    newVisited.add(key);
    setVisited(newVisited);
    setCurrent(current);
    setPath([...path, current]);

    if (current.x === end.x && current.y === end.y) {
      setFound(true);
      setIsRunning(false);
      onComplete();
      return;
    }

    const neighbors = getNeighbors(current);
    setQueue([...queue, ...neighbors]);
  };

  const stepDFS = () => {
    if (stack.length === 0 || found) {
      setIsRunning(false);
      return;
    }

    const current = stack.pop();
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) return;

    const newVisited = new Set(visited);
    newVisited.add(key);
    setVisited(newVisited);
    setCurrent(current);
    setPath([...path, current]);

    if (current.x === end.x && current.y === end.y) {
      setFound(true);
      setIsRunning(false);
      onComplete();
      return;
    }

    const neighbors = getNeighbors(current);
    setStack([...stack, ...neighbors.reverse()]);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (algorithm === 'bfs' || algorithm === 'dijkstra' || algorithm === 'astar') {
          stepBFS();
        } else if (algorithm === 'dfs') {
          stepDFS();
        }
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, queue, stack, visited, found, speed]);

  const toggleRunning = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    initializeGrid();
  };

  const cellSize = gridSize <= 15 ? 40 : gridSize <= 25 ? 28 : 20;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button
            onClick={toggleRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 font-medium"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <span>Speed:</span>
            <input
              type="range"
              min="10"
              max="500"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
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
              const isVisited = visited.has(key);
              const isCurrent = current?.x === x && current?.y === y;
              
              let bgColor = 'bg-white';
              if (cell.isWall) bgColor = 'bg-gray-800';
              else if (cell.isStart) bgColor = 'bg-green-500';
              else if (cell.isEnd) bgColor = 'bg-red-500';
              else if (isCurrent) bgColor = 'bg-blue-500';
              else if (isVisited) bgColor = 'bg-blue-100';

              return (
                <div
                  key={key}
                  className={`${bgColor} border border-gray-100`}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                />
              );
            })
          )}
        </div>
      </div>
      
      <div className="flex space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 border border-gray-300"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 border border-gray-300"></div>
          <span>End</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-800 border border-gray-300"></div>
          <span>Wall</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-gray-300"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 border border-gray-300"></div>
          <span>Current</span>
        </div>
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
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(50);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeArray();
  }, [algorithm, arraySize]);

  const initializeArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
    setArray(newArray);
    setComparing([]);
    setSorted([]);
    setCurrentStep(0);
    setIsRunning(false);
    
    if (algorithm === 'bubble') setSteps(generateBubbleSortSteps(newArray));
    else if (algorithm === 'quick') setSteps(generateQuickSortSteps(newArray));
    else if (algorithm === 'merge') setSteps(generateMergeSortSteps(newArray));
    else if (algorithm === 'heap') setSteps(generateHeapSortSteps(newArray));
    else if (algorithm === 'insertion') setSteps(generateInsertionSortSteps(newArray));
  };

  const generateBubbleSortSteps = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    
    for (let i = 0; i < tempArr.length; i++) {
      for (let j = 0; j < tempArr.length - i - 1; j++) {
        steps.push({ array: [...tempArr], comparing: [j, j + 1], sorted: [] });
        
        if (tempArr[j] > tempArr[j + 1]) {
          [tempArr[j], tempArr[j + 1]] = [tempArr[j + 1], tempArr[j]];
          steps.push({ array: [...tempArr], comparing: [j, j + 1], sorted: [] });
        }
      }
    }
    steps.push({ array: [...tempArr], comparing: [], sorted: Array.from({ length: tempArr.length }, (_, i) => i) });
    return steps;
  };

  const generateQuickSortSteps = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    
    const quickSort = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      }
    };
    
    const partition = (low, high) => {
      const pivot = tempArr[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        steps.push({ array: [...tempArr], comparing: [j, high], sorted: [] });
        
        if (tempArr[j] < pivot) {
          i++;
          [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
          steps.push({ array: [...tempArr], comparing: [i, j], sorted: [] });
        }
      }
      
      [tempArr[i + 1], tempArr[high]] = [tempArr[high], tempArr[i + 1]];
      return i + 1;
    };
    
    quickSort(0, tempArr.length - 1);
    steps.push({ array: [...tempArr], comparing: [], sorted: Array.from({ length: tempArr.length }, (_, i) => i) });
    return steps;
  };

  const generateMergeSortSteps = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    
    const merge = (left, mid, right) => {
      const leftArr = tempArr.slice(left, mid + 1);
      const rightArr = tempArr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        steps.push({ array: [...tempArr], comparing: [left + i, mid + 1 + j], sorted: [] });
        
        if (leftArr[i] <= rightArr[j]) {
          tempArr[k] = leftArr[i];
          i++;
        } else {
          tempArr[k] = rightArr[j];
          j++;
        }
        k++;
      }
      
      while (i < leftArr.length) {
        tempArr[k] = leftArr[i];
        i++;
        k++;
      }
      
      while (j < rightArr.length) {
        tempArr[k] = rightArr[j];
        j++;
        k++;
      }
    };
    
    const mergeSort = (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSort(left, mid);
        mergeSort(mid + 1, right);
        merge(left, mid, right);
      }
    };
    
    mergeSort(0, tempArr.length - 1);
    steps.push({ array: [...tempArr], comparing: [], sorted: Array.from({ length: tempArr.length }, (_, i) => i) });
    return steps;
  };

  const generateHeapSortSteps = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    const n = tempArr.length;
    
    const heapify = (n, i) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      
      if (left < n && tempArr[left] > tempArr[largest]) largest = left;
      if (right < n && tempArr[right] > tempArr[largest]) largest = right;
      
      if (largest !== i) {
        steps.push({ array: [...tempArr], comparing: [i, largest], sorted: [] });
        [tempArr[i], tempArr[largest]] = [tempArr[largest], tempArr[i]];
        heapify(n, largest);
      }
    };
    
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
    
    for (let i = n - 1; i > 0; i--) {
      steps.push({ array: [...tempArr], comparing: [0, i], sorted: [] });
      [tempArr[0], tempArr[i]] = [tempArr[i], tempArr[0]];
      heapify(i, 0);
    }
    
    steps.push({ array: [...tempArr], comparing: [], sorted: Array.from({ length: tempArr.length }, (_, i) => i) });
    return steps;
  };

  const generateInsertionSortSteps = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    
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
    
    steps.push({ array: [...tempArr], comparing: [], sorted: Array.from({ length: tempArr.length }, (_, i) => i) });
    return steps;
  };

  useEffect(() => {
    if (isRunning && currentStep < steps.length) {
      intervalRef.current = setInterval(() => {
        const step = steps[currentStep];
        setArray(step.array);
        setComparing(step.comparing);
        setSorted(step.sorted);
        setCurrentStep(prev => prev + 1);
        
        if (currentStep >= steps.length - 1) {
          setIsRunning(false);
          onComplete();
        }
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentStep, steps, speed]);

  const toggleRunning = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    initializeArray();
  };

  const barWidth = arraySize <= 20 ? 32 : arraySize <= 50 ? 16 : 8;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button
            onClick={toggleRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 font-medium"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <span>Speed:</span>
            <input
              type="range"
              min="10"
              max="200"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
          </label>
          {currentStep >= steps.length - 1 && steps.length > 0 && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Sorted in {steps.length} operations</span>
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
              <div
                key={idx}
                className={`${bgColor} transition-all duration-100 flex items-end justify-center`}
                style={{ width: `${barWidth}px`, height: `${value * 3}px` }}
              >
                {arraySize <= 30 && <span className="text-xs text-white font-medium">{value}</span>}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400"></div>
          <span>Unsorted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500"></div>
          <span>Comparing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Sorted</span>
        </div>
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
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [speed, setSpeed] = useState(300);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeArray();
  }, [algorithm, arraySize]);

  const initializeArray = () => {
    const sorted = Array.from({ length: arraySize }, (_, i) => (i + 1) * 5);
    setArray(sorted);
    const randomTarget = sorted[Math.floor(Math.random() * sorted.length)];
    setTarget(randomTarget);
    setCurrent(-1);
    setFound(false);
    setChecked([]);
    setLow(0);
    setHigh(sorted.length - 1);
    setIsRunning(false);
  };

  const stepLinearSearch = () => {
    if (current >= array.length - 1 || found) {
      setIsRunning(false);
      return;
    }

    const next = current + 1;
    setCurrent(next);
    setChecked([...checked, next]);

    if (array[next] === target) {
      setFound(true);
      setIsRunning(false);
      onComplete();
    }
  };

  const stepBinarySearch = () => {
    if (low > high || found) {
      setIsRunning(false);
      return;
    }

    const mid = Math.floor((low + high) / 2);
    setCurrent(mid);
    setChecked([...checked, mid]);

    if (array[mid] === target) {
      setFound(true);
      setIsRunning(false);
      onComplete();
      return;
    }

    if (array[mid] < target) {
      setLow(mid + 1);
    } else {
      setHigh(mid - 1);
    }
  };

  const stepJumpSearch = () => {
    const jump = Math.floor(Math.sqrt(array.length));
    let prev = 0;
    
    while (array[Math.min(jump, array.length) - 1] < target) {
      prev = jump;
      if (prev >= array.length) {
        setIsRunning(false);
        return;
      }
    }
    
    while (array[prev] < target) {
      setCurrent(prev);
      setChecked([...checked, prev]);
      prev++;
      
      if (prev === Math.min(jump, array.length)) {
        setIsRunning(false);
        return;
      }
    }
    
    if (array[prev] === target) {
      setCurrent(prev);
      setFound(true);
      setIsRunning(false);
      onComplete();
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (algorithm === 'linear') stepLinearSearch();
        else if (algorithm === 'binary') stepBinarySearch();
        else if (algorithm === 'jump') stepJumpSearch();
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, current, low, high, found, speed]);

  const toggleRunning = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    initializeArray();
  };

  const cellWidth = arraySize <= 20 ? 48 : arraySize <= 40 ? 32 : 24;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button
            onClick={toggleRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 font-medium"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Target: <span className="font-mono font-bold text-lg text-red-600">{target}</span>
          </div>
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <span>Speed:</span>
            <input
              type="range"
              min="100"
              max="1000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
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
            if (idx === current) bgColor = 'bg-blue-500';
            if (checked.includes(idx) && idx !== current) bgColor = 'bg-blue-100';
            if (found && idx === current) bgColor = 'bg-green-500';
            
            let textColor = 'text-gray-700';
            if (idx === current || (found && idx === current)) textColor = 'text-white';
            
            return (
              <div
                key={idx}
                className={`${bgColor} ${textColor} flex items-center justify-center border border-gray-300 font-mono font-semibold transition-all duration-200`}
                style={{ width: `${cellWidth}px`, height: `${cellWidth}px` }}
              >
                {arraySize <= 30 && value}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
          <span>Unchecked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-gray-300"></div>
          <span>Checked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 border border-gray-300"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 border border-gray-300"></div>
          <span>Found</span>
        </div>
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
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
              >
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grid Size (Graph Algorithms): {gridSize}x{gridSize}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Array Size (Sorting/Search): {arraySize} elements
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={arraySize}
                    onChange={(e) => setArraySize(Number(e.target.value))}
                    className="w-full"
                  />
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
                    <button
                      key={algo.id}
                      onClick={() => setSelectedAlgorithm(algo)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {algo.name}
                          </h3>
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
            <button
              onClick={() => setSelectedAlgorithm(null)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
            >
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