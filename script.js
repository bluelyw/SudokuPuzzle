class SudokuGame {
    constructor() {
        // 从HTML中读取初始宫格大小
        const gridSizeSelect = document.getElementById('grid-size-select');
        this.gridSize = gridSizeSelect ? parseInt(gridSizeSelect.value) : 9;
        
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
        // 随机选择生成方式：模板生成或随机生成
        const useRandomGeneration = Math.random() < 0.3; // 30%概率使用随机生成
        
        if (useRandomGeneration && this.gridSize <= 9) {
            // 使用真正的随机生成算法
            this.solution = this.generateRandomSudoku();
        } else {
            // 使用模板生成
            const templates = this.getTemplates();
            const template = templates[Math.floor(Math.random() * templates.length)];
            this.solution = template.map(row => [...row]);
            this.randomizeSolution();
        }
    }

    // 改进1：增加更多模板
    getTemplates() {
        switch (this.gridSize) {
            case 4:
                return [
                    [
                        [1,2,3,4],
                        [3,4,1,2],
                        [2,1,4,3],
                        [4,3,2,1]
                    ],
                    [
                        [2,1,4,3],
                        [4,3,2,1],
                        [1,2,3,4],
                        [3,4,1,2]
                    ],
                    [
                        [3,4,1,2],
                        [1,2,3,4],
                        [4,3,2,1],
                        [2,1,4,3]
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
                    ],
                    [
                        [2,3,1,5,6,4],
                        [5,6,4,2,3,1],
                        [3,1,2,6,4,5],
                        [6,4,5,3,1,2],
                        [1,2,3,4,5,6],
                        [4,5,6,1,2,3]
                    ],
                    [
                        [3,1,2,6,4,5],
                        [6,4,5,3,1,2],
                        [1,2,3,4,5,6],
                        [4,5,6,1,2,3],
                        [2,3,1,5,6,4],
                        [5,6,4,2,3,1]
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
                    ],
                    [
                        [1,2,3,4,5,6,7,8,9],
                        [4,5,6,7,8,9,1,2,3],
                        [7,8,9,1,2,3,4,5,6],
                        [2,3,1,5,6,4,8,9,7],
                        [5,6,4,8,9,7,2,3,1],
                        [8,9,7,2,3,1,5,6,4],
                        [3,1,2,6,4,5,9,7,8],
                        [6,4,5,9,7,8,3,1,2],
                        [9,7,8,3,1,2,6,4,5]
                    ],
                    [
                        [8,1,2,7,5,3,6,4,9],
                        [9,4,3,6,8,2,1,7,5],
                        [6,7,5,4,9,1,2,8,3],
                        [1,5,4,2,3,7,8,9,6],
                        [3,6,9,8,4,5,7,2,1],
                        [2,8,7,1,6,9,5,3,4],
                        [5,2,1,9,7,4,3,6,8],
                        [4,3,8,5,2,6,9,1,7],
                        [7,9,6,3,1,8,4,5,2]
                    ],
                    [
                        [2,7,6,3,1,4,9,5,8],
                        [8,5,4,9,6,2,7,1,3],
                        [9,1,3,8,7,5,2,6,4],
                        [4,6,8,1,2,7,3,9,5],
                        [5,9,7,4,3,8,6,2,1],
                        [1,3,2,6,5,9,8,4,7],
                        [3,2,5,7,4,1,6,8,9],
                        [6,8,9,2,9,3,1,7,4],
                        [7,4,1,5,8,6,4,3,2]
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
                    ],
                    [
                        [2,1,4,3,6,5,8,7,10,9,12,11,14,13,16,15],
                        [6,5,8,7,10,9,12,11,14,13,16,15,2,1,4,3],
                        [10,9,12,11,14,13,16,15,2,1,4,3,6,5,8,7],
                        [14,13,16,15,2,1,4,3,6,5,8,7,10,9,12,11],
                        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
                        [5,6,7,8,9,10,11,12,13,14,15,16,1,2,3,4],
                        [9,10,11,12,13,14,15,16,1,2,3,4,5,6,7,8],
                        [13,14,15,16,1,2,3,4,5,6,7,8,9,10,11,12],
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

    // 改进2：实现真正的随机生成算法
    generateRandomSudoku() {
        const board = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        
        // 填充对角线上的宫格
        const boxSize = Math.sqrt(this.gridSize);
        for (let i = 0; i < this.gridSize; i += boxSize + 1) {
            this.fillBox(board, i, i);
        }
        
        // 使用回溯算法解决剩余的单元格
        if (this.solveSudoku(board)) {
            return board;
        } else {
            // 如果失败，重新生成
            return this.generateRandomSudoku();
        }
    }

    fillBox(board, row, col) {
        const boxSize = Math.sqrt(this.gridSize);
        const numbers = Array.from({length: this.gridSize}, (_, i) => i + 1);
        
        for (let i = 0; i < boxSize; i++) {
            for (let j = 0; j < boxSize; j++) {
                const randomIndex = Math.floor(Math.random() * numbers.length);
                board[row + i][col + j] = numbers[randomIndex];
                numbers.splice(randomIndex, 1);
            }
        }
    }

    solveSudoku(board) {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (board[row][col] === 0) {
                    // 随机打乱数字顺序，增加随机性
                    const numbers = Array.from({length: this.gridSize}, (_, i) => i + 1);
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
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

    // 改进3：增加数独规则验证
    validateSudokuRules(board) {
        // 检查行
        for (let row = 0; row < this.gridSize; row++) {
            const rowNumbers = new Set();
            for (let col = 0; col < this.gridSize; col++) {
                const num = board[row][col];
                if (num !== 0) {
                    if (rowNumbers.has(num)) {
                        return { valid: false, type: 'row', position: row };
                    }
                    rowNumbers.add(num);
                }
            }
        }
        
        // 检查列
        for (let col = 0; col < this.gridSize; col++) {
            const colNumbers = new Set();
            for (let row = 0; row < this.gridSize; row++) {
                const num = board[row][col];
                if (num !== 0) {
                    if (colNumbers.has(num)) {
                        return { valid: false, type: 'column', position: col };
                    }
                    colNumbers.add(num);
                }
            }
        }
        
        // 检查宫格
        const boxSize = Math.sqrt(this.gridSize);
        for (let boxRow = 0; boxRow < this.gridSize; boxRow += boxSize) {
            for (let boxCol = 0; boxCol < this.gridSize; boxCol += boxSize) {
                const boxNumbers = new Set();
                for (let i = 0; i < boxSize; i++) {
                    for (let j = 0; j < boxSize; j++) {
                        const num = board[boxRow + i][boxCol + j];
                        if (num !== 0) {
                            if (boxNumbers.has(num)) {
                                return { valid: false, type: 'box', position: { row: boxRow, col: boxCol } };
                            }
                            boxNumbers.add(num);
                        }
                    }
                }
            }
        }
        
        return { valid: true };
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
            
            // 实时验证数独规则
            const validation = this.validateSudokuRules(this.board);
            if (!validation.valid) {
                this.selectedCell.classList.add('error');
                this.showMessage(`数独规则冲突：${validation.type === 'row' ? '行' : validation.type === 'column' ? '列' : '宫格'}中有重复数字！`, 'error');
            }
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

        // 改进3：使用数独规则验证
        const validation = this.validateSudokuRules(this.board);
        if (!validation.valid) {
            let errorMsg = '数独规则冲突：';
            if (validation.type === 'row') {
                errorMsg += `第${validation.position + 1}行有重复数字！`;
            } else if (validation.type === 'column') {
                errorMsg += `第${validation.position + 1}列有重复数字！`;
            } else {
                errorMsg += `宫格中有重复数字！`;
            }
            this.showMessage(errorMsg, 'error');
            return;
        }

        // 检查解答是否正确（与标准答案比较）
        let differences = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    differences.push({
                        row: row + 1,
                        col: col + 1,
                        userAnswer: this.board[row][col],
                        correctAnswer: this.solution[row][col]
                    });
                }
            }
        }
        
        if (differences.length > 0) {
            // 显示具体的错误信息
            let errorMsg = '解答不正确！错误位置：';
            differences.slice(0, 3).forEach(diff => {
                errorMsg += `第${diff.row}行第${diff.col}列应该是${diff.correctAnswer}而不是${diff.userAnswer}；`;
            });
            if (differences.length > 3) {
                errorMsg += `还有${differences.length - 3}个错误...`;
            }
            this.showMessage(errorMsg, 'error');
            return;
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