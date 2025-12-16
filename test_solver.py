"""
Test script for Puzzle Solver
Run this to test the algorithms without the web interface
"""

from puzzle_solver import solve_puzzle
import json

def test_algorithms():
    """Test all three algorithms on a sample puzzle."""
    
    # Test puzzle (solvable)
    test_board = [
        [1, 2, 3],
        [4, 0, 6],
        [7, 5, 8]
    ]
    
    print("=" * 60)
    print("Testing 8-Puzzle Solver")
    print("=" * 60)
    print(f"\nInitial State:")
    for row in test_board:
        print(row)
    print()
    
    algorithms = ["BFS", "DFS", "A*"]
    
    results = {}
    
    for algo in algorithms:
        print(f"\n{'='*60}")
        print(f"Testing {algo}")
        print(f"{'='*60}")
        
        result = solve_puzzle(test_board, algo)
        
        if result["success"]:
            print(f"✓ Solution found!")
            print(f"  Solution Depth: {result['solution_depth']}")
            print(f"  Nodes Expanded: {result['nodes_expanded']:,}")
            print(f"  Time Taken: {result['time_taken']} seconds")
            print(f"  Solution Path Length: {len(result['solution_path'])}")
        else:
            print(f"✗ Solution not found")
            if "error" in result:
                print(f"  Error: {result['error']}")
            if "message" in result:
                print(f"  Message: {result['message']}")
        
        results[algo] = result
    
    # Comparison table
    print(f"\n{'='*60}")
    print("COMPARISON TABLE")
    print(f"{'='*60}")
    print(f"{'Algorithm':<12} {'Depth':<8} {'Nodes':<15} {'Time (s)':<12} {'Optimal':<10}")
    print("-" * 60)
    
    for algo in algorithms:
        if results[algo]["success"]:
            depth = results[algo]["solution_depth"]
            nodes = results[algo]["nodes_expanded"]
            time_taken = results[algo]["time_taken"]
            optimal = "Yes" if algo in ["BFS", "A*"] else "No"
            print(f"{algo:<12} {depth:<8} {nodes:<15,} {time_taken:<12.4f} {optimal:<10}")
    
    print(f"\n{'='*60}")
    print("Test completed!")
    print(f"{'='*60}")

if __name__ == "__main__":
    test_algorithms()

