class SudokuGame {
    constructor() {
        this.gridSize = 9; // 默认9宫格
        this.board = [];
        this.solution = [];
        this.originalBoard = [];
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
        this.hintsUsed = 0;
        this.maxHints = 3;
        
        this.initializeGame();
        this.setupEventListeners();
        this.startTimer();
    }

    initializeGame() {
        this.createSudokuGrid();
        this.createNumberPad();
        this.generateNewGame();
    }

    createSudokuGrid() {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';
        grid.className = `grid-${this.gridSize}`;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.selectCell(row, col));
                grid.appendChild(cell);
            }
        }
    }

    createNumberPad() {
        const numberPad = document.getElementById('number-pad');
        numberPad.innerHTML = '';
        numberPad.className = `number-pad size-${this.gridSize}`;

        // 根据宫格大小生成数字按钮
        for (let i = 1; i <= this.gridSize; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.dataset.number = i;
            btn.textContent = i;
            btn.addEventListener('click', () => this.placeNumber(i));
            numberPad.appendChild(btn);
        }

        // 添加清除按钮
        const clearBtn = document.createElement('button');
        clearBtn.className = 'number-btn clear-btn';
        clearBtn.dataset.number = 0;
        clearBtn.textContent = '🗑️ 清除';
        clearBtn.addEventListener('click', () => this.placeNumber(0));
        numberPad.appendChild(clearBtn);
    }

    selectCell(row, col) {
        // 清除之前的选择
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        // 选择新单元格
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            // 检查这个单元格是否是原始数字（不能修改的）
            const originalValue = this.originalBoard[row][col];
            if (originalValue === 0) {
                // 只有空白单元格可以被选择
                cell.classList.add('selected');
                this.selectedCell = cell;
            } else {
                // 如果是原始数字，显示提示信息
                this.showMessage('这个数字是题目给定的，不能修改！', 'error');
            }
        }
    }

    generateNewGame() {
        this.generateSolution();
        this.createPuzzle();
        this.updateDisplay();
        this.resetTimer();
        this.hintsUsed = 0;
        this.showMessage(`新${this.gridSize}宫格游戏开始！加油！`, 'info');
    }

    generateSolution() {
        // 根据宫格大小生成不同的数独模板
        const templates = this.getTemplates();
        const template = templates[Math.floor(Math.random() * templates.length)];
        this.solution = template.map(row => [...row]);
        
        // 随机变换（交换数字）
        this.randomizeSolution();
    }

    getTemplates() {
        switch (this.gridSize) {
            case 4:
                return [
                    [
                        [1,2,3,4],
                        [3,4,1,2],
                        [2,1,4,3],
                        [4,3,2,1]
                    ]
                ];
            case 6:
                return [
                    [
                        [1,2,3,4,5,6],
                        [4,5,6,1,2,3],
                        [2,3,1,5,6,4],
                        [5,6,4,2,3,1],
                        [3,1,2,6,4,5],
                        [6,4,5,3,1,2]
                    ]
                ];
            case 9:
                return [
                    [
                        [5,3,4,6,7,8,9,1,2],
                        [6,7,2,1,9,5,3,4,8],
                        [1,9,8,3,4,2,5,6,7],
                        [8,5,9,7,6,1,4,2,3],
                        [4,2,6,8,5,3,7,9,1],
                        [7,1,3,9,2,4,8,5,6],
                        [9,6,1,5,3,7,2,8,4],
                        [2,8,7,4,1,9,6,3,5],
                        [3,4,5,2,8,6,1,7,9]
                    ]
                ];
            case 16:
                return [
                    [
                        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
                        [5,6,7,8,9,10,11,12,13,14,15,16,1,2,3,4],
                        [9,10,11,12,13,14,15,16,1,2,3,4,5,6,7,8],
                        [13,14,15,16,1,2,3,4,5,6,7,8,9,10,11,12],
                        [2,1,4,3,6,5,8,7,10,9,12,11,14,13,16,15],
                        [6,5,8,7,10,9,12,11,14,13,16,15,2,1,4,3],
                        [10,9,12,11,14,13,16,15,2,1,4,3,6,5,8,7],
                        [14,13,16,15,2,1,4,3,6,5,8,7,10,9,12,11],
                        [3,4,1,2,7,8,5,6,11,12,9,10,15,16,13,14],
                        [7,8,5,6,11,12,9,10,15,16,13,14,3,4,1,2],
                        [11,12,9,10,15,16,13,14,3,4,1,2,7,8,5,6],
                        [15,16,13,14,3,4,1,2,7,8,5,6,11,12,9,10],
                        [4,3,2,1,8,7,6,5,12,11,10,9,16,15,14,13],
                        [8,7,6,5,12,11,10,9,16,15,14,13,4,3,2,1],
                        [12,11,10,9,16,15,14,13,4,3,2,1,8,7,6,5],
                        [16,15,14,13,4,3,2,1,8,7,6,5,12,11,10,9]
                    ]
                ];
            default:
                return [];
        }
    }

    randomizeSolution() {
        // 随机交换数字
        const swaps = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < swaps; i++) {
            const num1 = Math.floor(Math.random() * this.gridSize) + 1;
            const num2 = Math.floor(Math.random() * this.gridSize) + 1;
            if (num1 !== num2) {
                this.swapNumbers(num1, num2);
            }
        }
    }

    swapNumbers(num1, num2) {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] === num1) {
                    this.solution[row][col] = num2;
                } else if (this.solution[row][col] === num2) {
                    this.solution[row][col] = num1;
                }
            }
        }
    }

    createPuzzle() {
        // 复制解答到游戏板
        this.board = this.solution.map(row => [...row]);
        
        const difficulty = document.getElementById('difficulty-select').value;
        let cellsToRemove;
        
        // 根据宫格大小和难度调整移除的单元格数量
        const totalCells = this.gridSize * this.gridSize;
        switch (difficulty) {
            case 'easy':
                cellsToRemove = Math.floor(totalCells * 0.5); // 保留50%的数字
                break;
            case 'medium':
                cellsToRemove = Math.floor(totalCells * 0.6); // 保留40%的数字
                break;
            case 'hard':
                cellsToRemove = Math.floor(totalCells * 0.7); // 保留30%的数字
                break;
            default:
                cellsToRemove = Math.floor(totalCells * 0.5);
        }
        
        // 随机移除单元格
        const positions = [];
        for (let i = 0; i < totalCells; i++) {
            positions.push(i);
        }
        
        for (let i = 0; i < cellsToRemove; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const pos = positions[randomIndex];
            const row = Math.floor(pos / this.gridSize);
            const col = pos % this.gridSize;
            
            this.board[row][col] = 0;
            positions.splice(randomIndex, 1);
        }
        
        // 设置原始数字（保留在游戏板上的数字）
        this.originalBoard = this.board.map(row => [...row]);
    }

    updateDisplay() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    const value = this.board[row][col];
                    const originalValue = this.originalBoard[row][col];
                    
                    cell.textContent = value || '';
                    cell.classList.remove('fixed', 'error', 'correct');
                    
                    if (originalValue !== 0) {
                        cell.classList.add('fixed');
                    }
                }
            }
        }
    }

    isValid(board, row, col, num) {
        // 检查行
        for (let x = 0; x < this.gridSize; x++) {
            if (board[row][x] === num) return false;
        }
        
        // 检查列
        for (let x = 0; x < this.gridSize; x++) {
            if (board[x][col] === num) return false;
        }
        
        // 检查宫格（根据宫格大小调整）
        const boxSize = Math.sqrt(this.gridSize);
        const startRow = Math.floor(row / boxSize) * boxSize;
        const startCol = Math.floor(col / boxSize) * boxSize;
        for (let i = 0; i < boxSize; i++) {
            for (let j = 0; j < boxSize; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        
        return true;
    }

    placeNumber(number) {
        if (!this.selectedCell) {
            this.showMessage('请先选择一个单元格！', 'error');
            return;
        }

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        if (this.originalBoard[row][col] !== 0) {
            this.showMessage('这个数字不能修改！', 'error');
            return;
        }

        if (number === 0) {
            // 清除单元格
            this.board[row][col] = 0;
            this.selectedCell.textContent = '';
            this.selectedCell.classList.remove('error', 'correct');
        } else {
            // 放置数字
            this.board[row][col] = number;
            this.selectedCell.textContent = number;
            this.selectedCell.classList.remove('error', 'correct');
        }
    }

    checkSolution() {
        // 检查是否所有单元格都已填写
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) {
                    this.showMessage('请先完成所有单元格！', 'error');
                    return;
                }
            }
        }

        // 检查解答是否正确
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    this.showMessage('解答不正确，请继续尝试！', 'error');
                    return;
                }
            }
        }

        this.showMessage(`🎉 恭喜！${this.gridSize}宫格数独完成！`, 'success');
        this.stopTimer();
    }

    provideHint() {
        if (this.hintsUsed >= this.maxHints) {
            this.showMessage(`提示次数已用完（最多${this.maxHints}次）`, 'error');
            return;
        }

        // 找到第一个空的单元格
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) {
                    const correctNumber = this.solution[row][col];
                    this.board[row][col] = correctNumber;
                    
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        cell.textContent = correctNumber;
                        cell.classList.add('correct');
                    }
                    
                    this.hintsUsed++;
                    this.showMessage(`提示：第${row + 1}行第${col + 1}列应该是${correctNumber}（剩余提示：${this.maxHints - this.hintsUsed}次）`, 'info');
                    return;
                }
            }
        }
    }

    solvePuzzle() {
        this.board = this.solution.map(row => [...row]);
        this.updateDisplay();
        this.showMessage(`${this.gridSize}宫格数独已自动解答完成！`, 'success');
        this.stopTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        this.startTimer();
    }

    updateTimerDisplay() {
        const timeEl = document.getElementById('time');
        if (timeEl) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `message ${type}`;
            
            // 3秒后自动清除消息
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'message';
            }, 3000);
        }
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= this.gridSize) {
                this.placeNumber(num);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.placeNumber(0);
            }
        });

        // 控制按钮事件
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.generateNewGame();
            });
        }

        const checkBtn = document.getElementById('check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.checkSolution();
            });
        }

        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                this.provideHint();
            });
        }

        const solveBtn = document.getElementById('solve-btn');
        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                this.solvePuzzle();
            });
        }

        // 宫格大小选择事件
        const gridSizeSelect = document.getElementById('grid-size-select');
        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', () => {
                this.gridSize = parseInt(gridSizeSelect.value);
                this.initializeGame();
            });
        }

        // 难度选择事件
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', () => {
                this.generateNewGame();
            });
        }
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SudokuGame();
        console.log('数独游戏初始化成功！');
    } catch (error) {
        console.error('游戏初始化失败:', error);
    }
}); 