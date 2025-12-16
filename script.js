// Intelligent Puzzle Solver - Frontend Logic

class PuzzleSolverUI {
    constructor() {
        this.puzzleSize = 3; // Default to 3×3
        this.currentState = this.getGoalState();
        this.solutionPath = [];
        this.currentStep = 0;
        this.autoPlayInterval = null;
        
        // Auto-detect API URL based on current page location
        // If served from Flask, use same origin; otherwise default to localhost:5000
        const baseUrl = window.location.origin.includes('5000') 
            ? window.location.origin 
            : (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
                ? 'http://localhost:5000'
                : window.location.origin.replace(/:\d+$/, ':5000')); // Replace port with 5000
        this.apiUrl = `${baseUrl}/solve`;
        this.healthUrl = `${baseUrl}/health`;
        
        this.initializeUI();
        this.setupEventListeners();
        this.checkConnection();
    }

    // Get goal state based on puzzle size
    getGoalState() {
        if (this.puzzleSize === 2) {
            return [
                [1, 2],
                [3, 0]
            ];
        } else {
            return [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 0]
            ];
        }
    }

    // Initialize the puzzle grid
    initializeUI() {
        this.renderPuzzle();
        this.updateAlgorithmInfo();
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shufflePuzzle());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetPuzzle());
        document.getElementById('solve-btn').addEventListener('click', () => this.solvePuzzle());
        document.getElementById('step-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('auto-btn').addEventListener('click', () => this.toggleAutoPlay());
        document.getElementById('algorithm-select').addEventListener('change', () => this.updateAlgorithmInfo());
        document.getElementById('puzzle-size').addEventListener('change', (e) => this.changePuzzleSize(parseInt(e.target.value)));
        document.getElementById('custom-btn').addEventListener('click', () => this.showCustomModal());
        document.getElementById('apply-custom-btn').addEventListener('click', () => this.applyCustomPuzzle());
        document.getElementById('cancel-custom-btn').addEventListener('click', () => this.hideCustomModal());
        document.querySelector('.close-modal').addEventListener('click', () => this.hideCustomModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('custom-modal');
            if (e.target === modal) {
                this.hideCustomModal();
            }
        });
    }

    // Render the puzzle grid
    renderPuzzle() {
        const grid = document.getElementById('puzzle-grid');
        grid.innerHTML = '';
        grid.className = `puzzle-grid size-${this.puzzleSize}`;
        grid.style.gridTemplateColumns = `repeat(${this.puzzleSize}, 1fr)`;

        // Find empty tile position
        let emptyRow = -1, emptyCol = -1;
        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                if (this.currentState[i][j] === 0) {
                    emptyRow = i;
                    emptyCol = j;
                    break;
                }
            }
        }

        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                const value = this.currentState[i][j];
                
                if (value === 0) {
                    tile.className += ' empty';
                    tile.textContent = '';
                } else {
                    tile.textContent = value;
                    // Check if tile is adjacent to empty space (clickable)
                    const isAdjacent = (Math.abs(i - emptyRow) === 1 && j === emptyCol) || 
                                     (Math.abs(j - emptyCol) === 1 && i === emptyRow);
                    if (isAdjacent) {
                        tile.classList.add('clickable');
                        tile.addEventListener('click', () => this.moveTile(i, j));
                    }
                }
                
                tile.dataset.row = i;
                tile.dataset.col = j;
                grid.appendChild(tile);
            }
        }
        
        // Update title
        const title = document.getElementById('puzzle-title');
        if (this.puzzleSize === 2) {
            title.textContent = '3-Puzzle Grid (2×2)';
        } else {
            title.textContent = '8-Puzzle Grid (3×3)';
        }
    }
    
    // Move tile by clicking (swap with empty space if adjacent)
    moveTile(row, col) {
        // Find empty tile
        let emptyRow = -1, emptyCol = -1;
        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                if (this.currentState[i][j] === 0) {
                    emptyRow = i;
                    emptyCol = j;
                    break;
                }
            }
        }
        
        // Check if clicked tile is adjacent to empty space
        const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) || 
                          (Math.abs(col - emptyCol) === 1 && row === emptyRow);
        
        if (isAdjacent) {
            // Swap tile with empty space
            const newState = this.currentState.map(r => [...r]);
            newState[emptyRow][emptyCol] = newState[row][col];
            newState[row][col] = 0;
            this.currentState = newState;
            this.renderPuzzle();
            this.clearSolution();
        }
    }
    
    // Change puzzle size
    changePuzzleSize(newSize) {
        this.puzzleSize = newSize;
        this.currentState = this.getGoalState();
        this.renderPuzzle();
        this.clearSolution();
    }

    // Shuffle puzzle to a random solvable state
    shufflePuzzle() {
        // Generate a random solvable puzzle by making random valid moves
        const moves = 50; // Number of random moves
        let state = this.getGoalState();
        
        for (let i = 0; i < moves; i++) {
            const successors = this.getSuccessors(state);
            if (successors.length > 0) {
                state = successors[Math.floor(Math.random() * successors.length)];
            }
        }
        
        this.currentState = state;
        this.renderPuzzle();
        this.clearSolution();
    }

    // Reset to goal state
    resetPuzzle() {
        this.currentState = this.getGoalState();
        this.renderPuzzle();
        this.clearSolution();
    }

    // Get valid successor states (for shuffling)
    getSuccessors(state) {
        const successors = [];
        let emptyRow = -1, emptyCol = -1;
        const size = state.length;

        // Find empty tile
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (state[i][j] === 0) {
                    emptyRow = i;
                    emptyCol = j;
                    break;
                }
            }
        }

        // Generate valid moves
        const moves = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of moves) {
            const newRow = emptyRow + dr;
            const newCol = emptyCol + dc;

            if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
                const newState = state.map(row => [...row]);
                newState[emptyRow][emptyCol] = newState[newRow][newCol];
                newState[newRow][newCol] = 0;
                successors.push(newState);
            }
        }

        return successors;
    }

    // Update algorithm information
    updateAlgorithmInfo() {
        const select = document.getElementById('algorithm-select');
        const info = document.getElementById('algorithm-info');
        const algorithm = select.value;

        const descriptions = {
            'BFS': '<strong>BFS:</strong> Explores level by level, guarantees optimal (shortest) solution. Time: O(b^d), Space: O(b^d).',
            'DFS': '<strong>DFS:</strong> Explores deeply before backtracking. Depth-limited to prevent infinite loops. May not find optimal solution.',
            'A*': '<strong>A*:</strong> Uses f(n) = g(n) + h(n) with Manhattan Distance heuristic. Optimal and more efficient than BFS.'
        };

        info.innerHTML = `<p>${descriptions[algorithm]}</p>`;
    }

    // Solve the puzzle using selected algorithm
    async solvePuzzle() {
        const algorithm = document.getElementById('algorithm-select').value;
        const solveBtn = document.getElementById('solve-btn');
        const metricsBox = document.getElementById('metrics');

        // Ensure all values are integers
        const boardToSend = this.currentState.map(row => 
            row.map(val => typeof val === 'string' ? parseInt(val) : val)
        );

        // Check solvability
        const solvability = this.checkSolvability(boardToSend);
        if (!solvability.isSolvable) {
            metricsBox.innerHTML = `<div class="message error">⚠️ This puzzle configuration is not solvable! ${solvability.reason || ''}</div>`;
            return;
        }

        // Disable solve button
        solveBtn.disabled = true;
        solveBtn.textContent = 'Solving...';

        // Show loading
        metricsBox.innerHTML = '<div class="loading"><div class="spinner"></div><p>Solving puzzle...</p></div>';

        try {
            console.log('Sending puzzle to solve:', boardToSend);
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    board: boardToSend,
                    algorithm: algorithm
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Solution result:', result);

            if (result.success) {
                this.solutionPath = result.solution_path;
                this.currentStep = 0;
                
                // Display metrics
                this.displayMetrics(result);
                
                // Enable step controls
                document.getElementById('step-btn').disabled = false;
                document.getElementById('auto-btn').disabled = false;
                
                // Display solution steps
                this.displaySolutionSteps(result.solution_path);
            } else {
                const errorMsg = result.error || result.message || 'Failed to solve puzzle';
                metricsBox.innerHTML = `<div class="message error">${errorMsg}</div>`;
                console.error('Solve error:', result);
            }
        } catch (error) {
            console.error('Error:', error);
            metricsBox.innerHTML = `<div class="message error">Error: ${error.message}. Make sure the backend server is running on port 5000.</div>`;
        } finally {
            solveBtn.disabled = false;
            solveBtn.textContent = 'Solve Puzzle';
        }
    }
    
    // Check if puzzle is solvable (using inversion count)
    checkSolvability(state) {
        const size = state.length;
        const flatState = [];
        
        // Flatten the state (ignore empty tile for inversion count)
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (state[i][j] !== 0) {
                    flatState.push(state[i][j]);
                }
            }
        }
        
        // Count inversions
        let inversions = 0;
        for (let i = 0; i < flatState.length; i++) {
            for (let j = i + 1; j < flatState.length; j++) {
                if (flatState[i] > flatState[j]) {
                    inversions++;
                }
            }
        }
        
        // Find empty tile row (0-indexed from bottom)
        let emptyRow = -1;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (state[i][j] === 0) {
                    emptyRow = size - i; // Row from bottom (1-indexed)
                    break;
                }
            }
        }
        
        // For 3×3: solvable if inversions is even
        // For 2×2: solvable if (inversions + emptyRow) is even
        let isSolvable;
        if (size === 3) {
            isSolvable = inversions % 2 === 0;
        } else { // size === 2
            isSolvable = (inversions + emptyRow) % 2 === 0;
        }
        
        return {
            isSolvable: isSolvable,
            inversions: inversions,
            emptyRow: emptyRow,
            reason: isSolvable ? null : `This puzzle has ${inversions} inversion(s) and is not solvable. Try a different configuration.`
        };
    }

    // Display performance metrics
    displayMetrics(result) {
        const metricsBox = document.getElementById('metrics');
        
        const metrics = [
            { label: 'Algorithm', value: result.algorithm },
            { label: 'Solution Depth', value: result.solution_depth },
            { label: 'Nodes Expanded', value: result.nodes_expanded.toLocaleString() },
            { label: 'Time Taken', value: `${result.time_taken} seconds` },
            { label: 'Max Queue/Stack Size', value: (result.max_queue_size || result.max_stack_size || 0).toLocaleString() }
        ];

        let html = '<div class="message success">Solution found!</div>';
        metrics.forEach(metric => {
            html += `
                <div class="metric-item">
                    <span class="metric-label">${metric.label}:</span>
                    <span class="metric-value">${metric.value}</span>
                </div>
            `;
        });

        metricsBox.innerHTML = html;
    }

    // Display solution steps
    displaySolutionSteps(path) {
        const solutionBox = document.getElementById('solution-steps');
        
        if (path.length === 0) {
            solutionBox.innerHTML = '<p class="placeholder">No solution steps</p>';
            return;
        }

        let html = `<p><strong>Total Steps: ${path.length - 1}</strong></p>`;
        html += '<div class="solution-steps">';
        
        path.forEach((step, index) => {
            html += `<div class="step-number">${index}</div>`;
        });
        
        html += '</div>';
        solutionBox.innerHTML = html;
    }

    // Show next step in solution
    nextStep() {
        if (this.solutionPath.length === 0) return;

        if (this.currentStep < this.solutionPath.length) {
            this.currentState = this.solutionPath[this.currentStep];
            this.renderPuzzle();
            this.highlightChangedTile(this.currentStep);
            this.currentStep++;
        } else {
            // Solution complete
            document.getElementById('step-btn').disabled = true;
            document.getElementById('auto-btn').disabled = true;
        }
    }

    // Highlight the tile that moved
    highlightChangedTile(step) {
        if (step === 0) return;

        const prevState = this.solutionPath[step - 1];
        const currState = this.solutionPath[step];

        // Find which tile moved
        const size = prevState.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (prevState[i][j] !== currState[i][j] && currState[i][j] !== 0) {
                    const tiles = document.querySelectorAll('.puzzle-tile');
                    const tileIndex = i * size + j;
                    tiles[tileIndex].classList.add('highlight');
                    
                    setTimeout(() => {
                        tiles[tileIndex].classList.remove('highlight');
                    }, 500);
                    return;
                }
            }
        }
    }

    // Toggle auto-play
    toggleAutoPlay() {
        const autoBtn = document.getElementById('auto-btn');
        
        if (this.autoPlayInterval) {
            // Stop auto-play
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            autoBtn.textContent = 'Auto Play';
        } else {
            // Start auto-play
            autoBtn.textContent = 'Stop Auto';
            this.autoPlayInterval = setInterval(() => {
                if (this.currentStep < this.solutionPath.length) {
                    this.nextStep();
                } else {
                    this.toggleAutoPlay(); // Stop when done
                }
            }, 800); // 800ms delay between steps
        }
    }

    // Clear solution
    clearSolution() {
        this.solutionPath = [];
        this.currentStep = 0;
        document.getElementById('step-btn').disabled = true;
        document.getElementById('auto-btn').disabled = true;
        document.getElementById('metrics').innerHTML = '<p class="placeholder">Click "Solve Puzzle" to see metrics</p>';
        document.getElementById('solution-steps').innerHTML = '<p class="placeholder">Solution will appear here</p>';
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            document.getElementById('auto-btn').textContent = 'Auto Play';
        }
    }
    
    // Show custom puzzle input modal
    showCustomModal() {
        const modal = document.getElementById('custom-modal');
        const inputGrid = document.getElementById('custom-input-grid');
        inputGrid.innerHTML = '';
        inputGrid.style.gridTemplateColumns = `repeat(${this.puzzleSize}, 1fr)`;
        inputGrid.className = `custom-input-grid size-${this.puzzleSize}`;
        
        // Create input fields for each cell
        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = this.puzzleSize * this.puzzleSize - 1;
                input.value = this.currentState[i][j];
                input.dataset.row = i;
                input.dataset.col = j;
                input.className = 'custom-input';
                inputGrid.appendChild(input);
            }
        }
        
        document.getElementById('custom-error').textContent = '';
        modal.style.display = 'block';
    }
    
    // Hide custom puzzle modal
    hideCustomModal() {
        document.getElementById('custom-modal').style.display = 'none';
    }
    
    // Apply custom puzzle configuration
    applyCustomPuzzle() {
        const inputs = document.querySelectorAll('.custom-input');
        const size = this.puzzleSize;
        const newState = [];
        const values = [];
        
        // Collect values (ensure they are integers)
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const value = parseInt(inputs[i * size + j].value, 10);
                if (isNaN(value)) {
                    document.getElementById('custom-error').textContent = `Invalid value at row ${i+1}, col ${j+1}. Please enter a number.`;
                    return;
                }
                row.push(value);
                values.push(value);
            }
            newState.push(row);
        }
        
        // Validate puzzle structure
        const errorMsg = this.validatePuzzle(newState, size);
        if (errorMsg) {
            document.getElementById('custom-error').textContent = errorMsg;
            return;
        }
        
        // Check solvability
        const solvability = this.checkSolvability(newState);
        if (!solvability.isSolvable) {
            document.getElementById('custom-error').textContent = 
                `⚠️ This puzzle is not solvable! ${solvability.reason} You can still set it, but it won't have a solution.`;
            // Allow setting unsolvable puzzle but warn user
        }
        
        // Apply puzzle (even if unsolvable, user might want to see the error)
        this.currentState = newState;
        this.renderPuzzle();
        this.clearSolution();
        this.hideCustomModal();
    }
    
    // Validate puzzle configuration
    validatePuzzle(state, size) {
        const maxValue = size * size - 1;
        const expectedValues = Array.from({length: maxValue + 1}, (_, i) => i);
        const foundValues = [];
        
        // Check all values are present and exactly one 0
        let zeroCount = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const value = state[i][j];
                if (value < 0 || value > maxValue) {
                    return `Invalid value: ${value}. Must be between 0 and ${maxValue}.`;
                }
                if (value === 0) {
                    zeroCount++;
                }
                foundValues.push(value);
            }
        }
        
        if (zeroCount !== 1) {
            return `Puzzle must have exactly one empty tile (0). Found ${zeroCount}.`;
        }
        
        // Check all required values are present
        foundValues.sort((a, b) => a - b);
        for (let i = 0; i < expectedValues.length; i++) {
            if (foundValues[i] !== expectedValues[i]) {
                return `Missing or duplicate values. Puzzle must contain all numbers from 0 to ${maxValue}.`;
            }
        }
        
        return null; // Valid puzzle
    }

    // Check backend connection
    async checkConnection() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        try {
            const response = await fetch(this.healthUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                statusIndicator.className = 'status-indicator connected';
                statusText.textContent = `✓ Connected to backend (${this.apiUrl.replace('/solve', '')})`;
                statusText.style.color = '#28a745';
            } else {
                throw new Error('Backend responded with error');
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator disconnected';
            statusText.textContent = `✗ Backend not connected. Please start the server: python puzzle_solver.py`;
            statusText.style.color = '#dc3545';
            console.error('Connection error:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleSolverUI();
});

