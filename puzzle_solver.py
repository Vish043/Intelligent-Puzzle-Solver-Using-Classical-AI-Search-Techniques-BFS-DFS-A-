"""
Intelligent Puzzle Solver Using Classical AI Search Techniques
=============================================================
M.Tech Academic Project

This module implements three classical AI search algorithms for solving sliding puzzles:
1. Breadth First Search (BFS)
2. Depth-Limited Depth First Search (DFS)
3. A* Search using Manhattan Distance heuristic

IMPORTANT: This solver supports 2×2 and 3×3 puzzles. 
15-Puzzle and larger puzzles are computationally infeasible for classical search algorithms.

Author: Academic Project
Date: 2024
"""

import time
import json
from collections import deque
from typing import List, Tuple, Optional, Set
import heapq


class PuzzleState:
    """
    State Representation for Sliding Puzzles
    ========================================
    
    The puzzle state is represented as an N×N grid (list of lists).
    Supports 2×2 and 3×3 puzzles.
    Empty tile is represented by 0.
    
    Example (3×3):
        [[1, 2, 3],
         [4, 5, 6],
         [7, 8, 0]]
    
    Example (2×2):
        [[1, 2],
         [3, 0]]
    
    This representation allows:
    - Easy visualization
    - Simple successor generation
    - Efficient goal testing
    """
    
    def __init__(self, board: List[List[int]], parent=None, move=None, depth=0, cost=0):
        """
        Initialize a puzzle state.
        
        Args:
            board: N×N grid representing the puzzle (2×2 or 3×3)
            parent: Parent state (for path reconstruction)
            move: Move that led to this state (for visualization)
            depth: Depth of this state in the search tree
            cost: Cost to reach this state (for A*)
        """
        self.board = [row[:] for row in board]  # Deep copy
        self.parent = parent
        self.move = move
        self.depth = depth
        self.cost = cost
        self.size = len(board)  # Dynamic size (2 or 3)
    
    def __eq__(self, other):
        """Check if two states are equal."""
        if not isinstance(other, PuzzleState):
            return False
        return self.board == other.board
    
    def __hash__(self):
        """Make state hashable for set operations."""
        return hash(tuple(tuple(row) for row in self.board))
    
    def __lt__(self, other):
        """For priority queue in A* (compare by cost)."""
        return self.cost < other.cost
    
    def find_empty(self) -> Tuple[int, int]:
        """
        Find the position of the empty tile (0).
        
        Returns:
            Tuple (row, col) of empty tile position
        """
        for i in range(self.size):
            for j in range(self.size):
                if self.board[i][j] == 0:
                    return (i, j)
        return None
    
    def is_goal(self) -> bool:
        """
        Goal Test
        =========
        
        Checks if the current state matches the goal state.
        Goal state for 3×3 (8-Puzzle):
            [[1, 2, 3],
             [4, 5, 6],
             [7, 8, 0]]
        
        Goal state for 2×2:
            [[1, 2],
             [3, 0]]
        
        Returns:
            True if current state is goal state
        """
        if self.size == 2:
            goal = [[1, 2], [3, 0]]
        else:  # size == 3
            goal = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]
        return self.board == goal
    
    def get_goal_state(self) -> List[List[int]]:
        """Get the goal state for the current puzzle size."""
        if self.size == 2:
            return [[1, 2], [3, 0]]
        else:  # size == 3
            return [[1, 2, 3], [4, 5, 6], [7, 8, 0]]
    
    def get_successors(self) -> List['PuzzleState']:
        """
        Successor Function
        ==================
        
        Generates all possible next states by moving the empty tile.
        Valid moves: UP, DOWN, LEFT, RIGHT
        
        Returns:
            List of valid successor states
        """
        successors = []
        row, col = self.find_empty()
        
        # Possible moves: (row_delta, col_delta, move_name)
        moves = [
            (-1, 0, "UP"),    # Move empty tile up
            (1, 0, "DOWN"),   # Move empty tile down
            (0, -1, "LEFT"),  # Move empty tile left
            (0, 1, "RIGHT")   # Move empty tile right
        ]
        
        for dr, dc, move_name in moves:
            new_row, new_col = row + dr, col + dc
            
            # Check if move is within bounds
            if 0 <= new_row < self.size and 0 <= new_col < self.size:
                # Create new board state
                new_board = [r[:] for r in self.board]
                new_board[row][col], new_board[new_row][new_col] = \
                    new_board[new_row][new_col], new_board[row][col]
                
                # Create new state
                new_state = PuzzleState(
                    new_board,
                    parent=self,
                    move=move_name,
                    depth=self.depth + 1,
                    cost=self.cost + 1
                )
                successors.append(new_state)
        
        return successors
    
    def manhattan_distance(self) -> int:
        """
        Manhattan Distance Heuristic
        ============================
        
        Calculates the sum of Manhattan distances of each tile from its goal position.
        
        Why Manhattan Distance is Admissible:
        - It never overestimates the actual cost (always ≤ optimal cost)
        - It's consistent (satisfies triangle inequality)
        - It provides better guidance than h(n)=0 (uniform cost search)
        
        Formula for each tile:
            distance = |current_row - goal_row| + |current_col - goal_col|
        
        Returns:
            Sum of Manhattan distances for all tiles
        """
        distance = 0
        
        # Goal positions for 2×2 puzzle
        if self.size == 2:
            goal_positions = {
                1: (0, 0), 2: (0, 1),
                3: (1, 0), 0: (1, 1)
            }
        else:  # size == 3
            goal_positions = {
                1: (0, 0), 2: (0, 1), 3: (0, 2),
                4: (1, 0), 5: (1, 1), 6: (1, 2),
                7: (2, 0), 8: (2, 1), 0: (2, 2)
            }
        
        for i in range(self.size):
            for j in range(self.size):
                tile = self.board[i][j]
                if tile != 0:  # Don't count empty tile
                    goal_row, goal_col = goal_positions[tile]
                    distance += abs(i - goal_row) + abs(j - goal_col)
        
        return distance
    
    def to_list(self) -> List[List[int]]:
        """Convert state to list format for JSON serialization."""
        return self.board


def bfs_solve(initial_state: PuzzleState) -> dict:
    """
    Breadth First Search (BFS)
    ==========================
    
    Algorithm:
    1. Use a queue (FIFO) to explore states level by level
    2. Explore all states at depth d before moving to depth d+1
    3. Guarantees optimal solution (shortest path)
    
    Time Complexity: O(b^d) where b=branching factor, d=depth
    Space Complexity: O(b^d)
    
    Args:
        initial_state: Starting puzzle state
    
    Returns:
        Dictionary with solution path, metrics, and status
    """
    start_time = time.time()
    nodes_expanded = 0
    max_queue_size = 0
    
    # Initialize queue and visited set
    queue = deque([initial_state])
    visited: Set[PuzzleState] = set()
    visited.add(initial_state)
    
    while queue:
        max_queue_size = max(max_queue_size, len(queue))
        current = queue.popleft()
        nodes_expanded += 1
        
        # Goal test
        if current.is_goal():
            # Reconstruct path
            path = []
            state = current
            while state:
                path.append(state.to_list())
                state = state.parent
            path.reverse()
            
            elapsed_time = time.time() - start_time
            
            return {
                "success": True,
                "algorithm": "BFS",
                "solution_path": path,
                "solution_depth": len(path) - 1,
                "nodes_expanded": nodes_expanded,
                "time_taken": round(elapsed_time, 4),
                "max_queue_size": max_queue_size
            }
        
        # Generate successors
        for successor in current.get_successors():
            if successor not in visited:
                visited.add(successor)
                queue.append(successor)
    
    elapsed_time = time.time() - start_time
    return {
        "success": False,
        "algorithm": "BFS",
        "nodes_expanded": nodes_expanded,
        "time_taken": round(elapsed_time, 4),
        "max_queue_size": max_queue_size
    }


def dfs_solve(initial_state: PuzzleState, depth_limit: int = 50) -> dict:
    """
    Depth-Limited Depth First Search (DFS)
    =======================================
    
    Algorithm:
    1. Use a stack (LIFO) to explore states deeply
    2. Explore one branch completely before backtracking
    3. Depth limit prevents infinite recursion
    
    Note: DFS is NOT optimal (may not find shortest path)
    
    Time Complexity: O(b^m) where b=branching factor, m=max depth
    Space Complexity: O(b*m)
    
    Args:
        initial_state: Starting puzzle state
        depth_limit: Maximum depth to explore (default: 50)
    
    Returns:
        Dictionary with solution path, metrics, and status
    """
    start_time = time.time()
    nodes_expanded = 0
    max_stack_size = 0
    
    # Initialize stack and visited set
    stack = [initial_state]
    visited: Set[PuzzleState] = set()
    visited.add(initial_state)
    
    while stack:
        max_stack_size = max(max_stack_size, len(stack))
        current = stack.pop()
        nodes_expanded += 1
        
        # Goal test
        if current.is_goal():
            # Reconstruct path
            path = []
            state = current
            while state:
                path.append(state.to_list())
                state = state.parent
            path.reverse()
            
            elapsed_time = time.time() - start_time
            
            return {
                "success": True,
                "algorithm": "DFS",
                "solution_path": path,
                "solution_depth": len(path) - 1,
                "nodes_expanded": nodes_expanded,
                "time_taken": round(elapsed_time, 4),
                "max_stack_size": max_stack_size
            }
        
        # Check depth limit
        if current.depth < depth_limit:
            # Generate successors (reverse order for consistent exploration)
            successors = current.get_successors()
            successors.reverse()  # Explore in reverse order
            
            for successor in successors:
                if successor not in visited:
                    visited.add(successor)
                    stack.append(successor)
    
    elapsed_time = time.time() - start_time
    return {
        "success": False,
        "algorithm": "DFS",
        "nodes_expanded": nodes_expanded,
        "time_taken": round(elapsed_time, 4),
        "max_stack_size": max_stack_size,
        "message": f"No solution found within depth limit of {depth_limit}"
    }


def astar_solve(initial_state: PuzzleState) -> dict:
    """
    A* Search Algorithm
    ===================
    
    Algorithm:
    1. Uses priority queue ordered by f(n) = g(n) + h(n)
       where g(n) = cost from start, h(n) = heuristic estimate
    2. Manhattan Distance heuristic is used for h(n)
    3. Guarantees optimal solution when heuristic is admissible
    
    Why Manhattan Distance is Suitable:
    - Admissible: Never overestimates (always ≤ actual cost)
    - Consistent: Satisfies h(n) ≤ c(n,n') + h(n')
    - More informed than uniform cost search
    
    Time Complexity: O(b^d) with better pruning than BFS
    Space Complexity: O(b^d)
    
    Cost Function: f(n) = g(n) + h(n)
    - g(n): Actual cost from initial state to current state
    - h(n): Manhattan Distance heuristic estimate
    
    Args:
        initial_state: Starting puzzle state
    
    Returns:
        Dictionary with solution path, metrics, and status
    """
    start_time = time.time()
    nodes_expanded = 0
    max_queue_size = 0
    
    # Initialize priority queue
    # Priority: (f(n), h(n), state) where f(n) = g(n) + h(n)
    initial_state.cost = initial_state.manhattan_distance()
    priority_queue = [(initial_state.cost, initial_state.cost, initial_state)]
    visited: Set[PuzzleState] = set()
    visited.add(initial_state)
    
    while priority_queue:
        max_queue_size = max(max_queue_size, len(priority_queue))
        _, _, current = heapq.heappop(priority_queue)
        nodes_expanded += 1
        
        # Goal test
        if current.is_goal():
            # Reconstruct path
            path = []
            state = current
            while state:
                path.append(state.to_list())
                state = state.parent
            path.reverse()
            
            elapsed_time = time.time() - start_time
            
            return {
                "success": True,
                "algorithm": "A*",
                "solution_path": path,
                "solution_depth": len(path) - 1,
                "nodes_expanded": nodes_expanded,
                "time_taken": round(elapsed_time, 4),
                "max_queue_size": max_queue_size
            }
        
        # Generate successors
        for successor in current.get_successors():
            if successor not in visited:
                # Calculate f(n) = g(n) + h(n)
                g_n = successor.depth  # Actual cost from start
                h_n = successor.manhattan_distance()  # Heuristic estimate
                f_n = g_n + h_n
                successor.cost = f_n
                
                visited.add(successor)
                heapq.heappush(priority_queue, (f_n, h_n, successor))
    
    elapsed_time = time.time() - start_time
    return {
        "success": False,
        "algorithm": "A*",
        "nodes_expanded": nodes_expanded,
        "time_taken": round(elapsed_time, 4),
        "max_queue_size": max_queue_size
    }


def solve_puzzle(initial_board: List[List[int]], algorithm: str) -> dict:
    """
    Main solver function that routes to appropriate algorithm.
    
    Args:
        initial_board: N×N initial puzzle configuration (2×2 or 3×3)
        algorithm: "BFS", "DFS", or "A*"
    
    Returns:
        Solution dictionary with path and metrics
    """
    # Validate puzzle size
    size = len(initial_board)
    if size not in [2, 3]:
        return {
            "success": False,
            "error": f"Invalid puzzle size. Only 2×2 and 3×3 puzzles are supported. Got {size}×{size}."
        }
    
    # Validate all rows have same size
    if any(len(row) != size for row in initial_board):
        return {
            "success": False,
            "error": f"Invalid puzzle: All rows must have the same size ({size})."
        }
    
    initial_state = PuzzleState(initial_board)
    
    if algorithm == "BFS":
        return bfs_solve(initial_state)
    elif algorithm == "DFS":
        return dfs_solve(initial_state, depth_limit=50)
    elif algorithm == "A*":
        return astar_solve(initial_state)
    else:
        return {
            "success": False,
            "error": f"Unknown algorithm: {algorithm}"
        }


# ============================================================================
# Limitations and Future Scope
# ============================================================================
"""
LIMITATIONS:
1. Only supports 2×2 and 3×3 puzzles. 15-Puzzle requires IDA* or other advanced techniques.
2. DFS may not find optimal solution (not guaranteed to be shortest path).
3. No parallel processing - single-threaded execution.
4. Memory intensive for complex initial states (BFS stores all explored states).

FUTURE SCOPE:
1. Implement Iterative Deepening A* (IDA*) for 15-Puzzle support.
2. Add pattern database heuristics for better performance.
3. Implement bidirectional search for faster solutions.
4. Add GPU acceleration for parallel state exploration.
5. Implement machine learning-based heuristics.
6. Add support for custom puzzle sizes with appropriate algorithms.
7. Implement visualization of search tree/graph.
8. Add puzzle generator with solvability checking.
"""


# Flask server for web interface
if __name__ == "__main__":
    try:
        from flask import Flask, request, jsonify, send_from_directory
        from flask_cors import CORS
        import os
        
        app = Flask(__name__, static_folder='.')
        CORS(app)
        
        @app.route('/')
        def index():
            """Serve the main HTML page."""
            return send_from_directory('.', 'index.html')
        
        @app.route('/<path:filename>')
        def static_files(filename):
            """Serve static files (CSS, JS)."""
            if filename in ['style.css', 'script.js']:
                return send_from_directory('.', filename)
            return "File not found", 404
        
        @app.route('/solve', methods=['POST'])
        def solve():
            """API endpoint for solving puzzle."""
            try:
                data = request.json
                initial_board = data.get('board')
                algorithm = data.get('algorithm', 'BFS')
                
                # Ensure all values are integers
                if initial_board:
                    initial_board = [[int(cell) for cell in row] for row in initial_board]
                
                result = solve_puzzle(initial_board, algorithm)
                return jsonify(result)
            except Exception as e:
                return jsonify({
                    "success": False,
                    "error": f"Error processing request: {str(e)}"
                }), 400
        
        @app.route('/health', methods=['GET'])
        def health():
            """Health check endpoint."""
            return jsonify({"status": "healthy", "supported_sizes": ["2×2", "3×3"]})
        
        print("=" * 60)
        print("Starting Puzzle Solver Server...")
        print("=" * 60)
        print("🌐 Web Interface: http://localhost:5000")
        print("📡 API Endpoint: http://localhost:5000/solve")
        print("❤️  Health Check: http://localhost:5000/health")
        print("✅ This system supports 2×2 and 3×3 puzzles")
        print("⚠️  15-Puzzle and larger are not supported")
        print("=" * 60)
        app.run(debug=True, port=5000)
        
    except ImportError:
        # If Flask is not available, run as standalone
        print("Flask not installed. Running in standalone mode.")
        print("To use web interface, install: pip install flask flask-cors")
        
        # Example usage
        example_board = [[1, 2, 3], [4, 0, 6], [7, 5, 8]]
        print("\nExample: Solving puzzle with BFS")
        result = solve_puzzle(example_board, "BFS")
        print(json.dumps(result, indent=2))

