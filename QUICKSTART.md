# Quick Start Guide

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Start the Backend Server

```bash
python puzzle_solver.py
```

You should see:
```
Starting Puzzle Solver Server...
Server running at http://localhost:5000
⚠️  This system supports only 3×3 (8-Puzzle)
```

## Step 3: Open the Frontend

**Option A: Direct File Open**
- Simply open `index.html` in your web browser

**Option B: Local Server (Recommended)**
```bash
# In a new terminal
python -m http.server 8000
# Then open http://localhost:8000/index.html
```

## Step 4: Use the Application

1. **Shuffle** the puzzle or use the default state
2. **Select** an algorithm (BFS/DFS/A*)
3. **Click** "Solve Puzzle"
4. **View** metrics and step through the solution

## Testing Without Web Interface

Run the test script:
```bash
python test_solver.py
```

This will test all three algorithms and show a comparison table.

## Troubleshooting

**"Error: Failed to fetch"**
- Make sure the backend server is running on port 5000
- Check that Flask is installed: `pip install flask flask-cors`

**Puzzle not solving**
- Ensure the puzzle is solvable (even number of inversions)
- Check browser console (F12) for errors

**Port already in use**
- Change port in `puzzle_solver.py`: `app.run(debug=True, port=5001)`
- Update `script.js`: Change `apiUrl` to `'http://localhost:5001/solve'`

