# Intelligent Puzzle Solver Using Classical AI Search Techniques

## M.Tech Academic Project

This project implements three classical AI search algorithms to solve the **8-Puzzle (3×3 sliding puzzle)**:
1. **Breadth First Search (BFS)**
2. **Depth-Limited Depth First Search (DFS)**
3. **A* Search** using Manhattan Distance heuristic

---

## ⚠️ Important Notice

**This system supports ONLY 3×3 (8-Puzzle).**  
Larger puzzles like 15-Puzzle are computationally infeasible for classical search algorithms and are **NOT supported** in this implementation.

---

## Project Structure

```
.
├── puzzle_solver.py    # Backend Python solver (BFS, DFS, A*)
├── index.html          # Frontend HTML structure
├── style.css           # Frontend styling
├── script.js           # Frontend JavaScript logic
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

---

## Architecture

### Backend (Python)

**State Representation:**
- 3×3 grid stored as list of lists
- Empty tile represented by `0`
- Example: `[[1, 2, 3], [4, 5, 6], [7, 8, 0]]`

**Key Components:**
1. **PuzzleState Class**: Encapsulates puzzle state with methods for:
   - Goal testing
   - Successor generation
   - Manhattan Distance calculation

2. **Search Algorithms:**
   - **BFS**: Queue-based level-by-level exploration
   - **DFS**: Stack-based depth-first exploration (depth-limited)
   - **A***: Priority queue with f(n) = g(n) + h(n)

3. **Flask API**: RESTful endpoint `/solve` for web interface

### Frontend (HTML/CSS/JavaScript)

**Components:**
1. **Puzzle Grid**: Visual 3×3 grid with interactive tiles
2. **Algorithm Selector**: Dropdown to choose BFS/DFS/A*
3. **Control Buttons**: Solve, Step, Auto-play, Shuffle, Reset
4. **Metrics Display**: Shows nodes expanded, solution depth, time taken
5. **Solution Visualization**: Step-by-step animation of solution path

---

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Web browser (Chrome, Firefox, Edge)

### Steps

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the backend server:**
   ```bash
   python puzzle_solver.py
   ```
   Server will run on `http://localhost:5000`

3. **Open the frontend:**
   - Open `index.html` in your web browser
   - Or use a local server (e.g., `python -m http.server 8000`)

4. **Use the application:**
   - Shuffle or set up a puzzle
   - Select an algorithm (BFS/DFS/A*)
   - Click "Solve Puzzle"
   - View metrics and step through solution

---

## Algorithm Details

### 1. Breadth First Search (BFS)

**How it works:**
- Explores all states at depth `d` before moving to depth `d+1`
- Uses a queue (FIFO) data structure
- Guarantees optimal (shortest) solution

**Complexity:**
- Time: O(b^d) where b = branching factor (~4), d = solution depth
- Space: O(b^d)

**When to use:** When optimality is required

---

### 2. Depth-Limited DFS

**How it works:**
- Explores deeply along one branch before backtracking
- Uses a stack (LIFO) data structure
- Depth limit prevents infinite recursion (default: 50)

**Complexity:**
- Time: O(b^m) where m = maximum depth
- Space: O(b*m)

**Note:** May not find optimal solution

**When to use:** When memory is limited

---

### 3. A* Search

**How it works:**
- Uses priority queue ordered by f(n) = g(n) + h(n)
  - **g(n)**: Actual cost from start to current state
  - **h(n)**: Manhattan Distance heuristic estimate
- Expands most promising nodes first

**Manhattan Distance Heuristic:**
- For each tile, calculates: |current_row - goal_row| + |current_col - goal_col|
- Sum of all tile distances
- **Admissible**: Never overestimates actual cost
- **Consistent**: Satisfies triangle inequality

**Complexity:**
- Time: O(b^d) with better pruning than BFS
- Space: O(b^d)

**When to use:** Best balance of optimality and efficiency

---

## Performance Evaluation

### Sample Results (Typical 8-Puzzle)

| Algorithm | Solution Depth | Nodes Expanded | Time (seconds) | Optimal? |
|-----------|---------------|----------------|----------------|----------|
| **BFS**   | 20            | ~50,000        | 0.15           | Yes      |
| **DFS**   | 45            | ~8,000         | 0.08           | No       |
| **A***    | 20            | ~1,200         | 0.03           | Yes      |

*Note: Actual values depend on initial puzzle configuration*

### Observations:
- **A*** is most efficient (fewest nodes expanded)
- **BFS** guarantees optimality but explores more nodes
- **DFS** may find longer solutions but uses less memory

---

## Code Structure

### State Representation
```python
board = [[1, 2, 3],
         [4, 5, 6],
         [7, 8, 0]]  # 0 = empty tile
```

### Successor Function
Generates valid moves: UP, DOWN, LEFT, RIGHT (if within bounds)

### Goal Test
Checks if current state matches:
```python
[[1, 2, 3],
 [4, 5, 6],
 [7, 8, 0]]
```

### Cost Function (A*)
- **g(n)**: Number of moves from initial state
- **h(n)**: Manhattan Distance heuristic
- **f(n)**: g(n) + h(n)

---

## Limitations

1. **Puzzle Size**: Only supports 3×3 (8-Puzzle)
   - 15-Puzzle requires IDA* or pattern databases
   - Larger puzzles are computationally infeasible

2. **DFS Optimality**: DFS does not guarantee optimal solution

3. **Memory Usage**: BFS stores all explored states (memory intensive)

4. **Single-threaded**: No parallel processing

---

## Future Scope

1. **IDA* (Iterative Deepening A*)**: For 15-Puzzle support
2. **Pattern Database Heuristics**: Pre-computed heuristics for better performance
3. **Bidirectional Search**: Faster solutions by searching from both ends
4. **GPU Acceleration**: Parallel state exploration
5. **Machine Learning Heuristics**: Learned heuristics from solved puzzles
6. **Search Tree Visualization**: Visual representation of explored states
7. **Puzzle Generator**: Generate solvable puzzles with difficulty levels

---

## Academic Notes

### For Viva/Explanation:

1. **State Space**: 9! / 2 = 181,440 reachable states (half are unsolvable)

2. **Why Manhattan Distance?**
   - Admissible: Never overestimates
   - Consistent: Satisfies triangle inequality
   - More informed than h(n) = 0 (uniform cost)

3. **Why not Misplaced Tiles?**
   - Manhattan Distance is more informed
   - Better pruning leads to fewer nodes expanded
   - Still admissible and consistent

4. **Solvability Check:**
   - Count inversions (tiles before their goal position)
   - Puzzle is solvable if inversions are even

---

## Troubleshooting

**Backend not connecting:**
- Ensure Flask server is running on port 5000
- Check firewall settings
- Verify `flask` and `flask-cors` are installed

**Puzzle not solving:**
- Ensure puzzle is solvable (even number of inversions)
- Check browser console for errors
- Verify initial state is valid 3×3 grid

---

## License

Academic Project - For Educational Purposes

---

## Author

M.Tech Academic Project  
Intelligent Puzzle Solver Using Classical AI Search Techniques

