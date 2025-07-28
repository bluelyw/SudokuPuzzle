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
        
        // 笔记功能相关
        this.notes = {}; // 存储每个单元格的笔记 { "row-col": [1,2,3] }
        this.isNoteMode = false; // 是否处于笔记模式
        
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
                
                // 创建笔记容器 - 简化版本
                const notesContainer = document.createElement('div');
                notesContainer.className = 'notes-container';
                notesContainer.innerHTML = ''; // 确保初始为空
                cell.appendChild(notesContainer);
                
                // 立即验证笔记容器
                const addedContainer = cell.querySelector('.notes-container');
                if (addedContainer) {
                    console.log(`✅ 成功创建单元格: 第${row+1}行第${col+1}列，笔记容器已添加`);
                } else {
                    console.error(`❌ 失败创建单元格: 第${row+1}行第${col+1}列，笔记容器未添加`);
                }
                
                grid.appendChild(cell);
            }
        }
    }

    createNumberPad() {
        const numberPad = document.getElementById('number-pad');
        numberPad.innerHTML = '';
        numberPad.className = `number-pad size-${this.gridSize}`;

        // 添加笔记模式切换按钮
        const noteModeBtn = document.createElement('button');
        noteModeBtn.className = 'number-btn note-mode-btn';
        noteModeBtn.id = 'note-mode-btn';
        noteModeBtn.textContent = '📝 笔记';
        noteModeBtn.addEventListener('click', () => this.toggleNoteMode());
        numberPad.appendChild(noteModeBtn);

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
        this.notes = {}; // 清除所有笔记
        this.isNoteMode = false; // 重置笔记模式
        this.updateDisplay();
        this.resetTimer();
        this.hintsUsed = 0;
        this.showMessage(`新${this.gridSize}宫格游戏开始！加油！`, 'info');
        
        // 重置笔记模式按钮
        const noteModeBtn = document.getElementById('note-mode-btn');
        if (noteModeBtn) {
            noteModeBtn.classList.remove('active');
            noteModeBtn.textContent = '📝 笔记';
        }
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
            // 移除随机化，直接使用验证过的模板
        }
        
        // 验证生成的解答是否正确
        const validation = this.validateSudokuRules(this.solution);
        if (!validation.valid) {
            console.error('生成的数独解答有错误，重新生成...');
            this.generateSolution(); // 递归重新生成
            return; // 防止无限递归
        }
        
        // 额外验证：确保每个数字在每行、每列、每个宫格中只出现一次
        if (!this.isValidSudoku(this.solution)) {
            console.error('数独解答验证失败，重新生成...');
            this.generateSolution();
            return;
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
        console.log('开始更新显示...');
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    const value = this.board[row][col];
                    const originalValue = this.originalBoard[row][col];
                    
                    cell.classList.remove('fixed', 'error', 'correct');
                    
                    if (originalValue !== 0) {
                        cell.classList.add('fixed');
                    }
                    
                    // 使用新的显示方法
                    this.updateCellDisplay(row, col);
                } else {
                    console.error(`找不到单元格: 第${row+1}行第${col+1}列`);
                }
            }
        }
        console.log('显示更新完成');
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
        // 检查行（排除当前位置）
        for (let x = 0; x < this.gridSize; x++) {
            if (x !== col && board[row][x] === num) return false;
        }
        
        // 检查列（排除当前位置）
        for (let x = 0; x < this.gridSize; x++) {
            if (x !== row && board[x][col] === num) return false;
        }
        
        // 检查宫格（排除当前位置）
        const boxSize = Math.sqrt(this.gridSize);
        const startRow = Math.floor(row / boxSize) * boxSize;
        const startCol = Math.floor(col / boxSize) * boxSize;
        for (let i = 0; i < boxSize; i++) {
            for (let j = 0; j < boxSize; j++) {
                const checkRow = i + startRow;
                const checkCol = j + startCol;
                if ((checkRow !== row || checkCol !== col) && board[checkRow][checkCol] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    isValidSudoku(board) {
        // 检查行
        for (let row = 0; row < this.gridSize; row++) {
            const rowSet = new Set();
            for (let col = 0; col < this.gridSize; col++) {
                const num = board[row][col];
                if (num === 0) continue;
                if (rowSet.has(num)) {
                    console.error(`第${row + 1}行有重复数字: ${num}`);
                    return false;
                }
                rowSet.add(num);
            }
        }
        
        // 检查列
        for (let col = 0; col < this.gridSize; col++) {
            const colSet = new Set();
            for (let row = 0; row < this.gridSize; row++) {
                const num = board[row][col];
                if (num === 0) continue;
                if (colSet.has(num)) {
                    console.error(`第${col + 1}列有重复数字: ${num}`);
                    return false;
                }
                colSet.add(num);
            }
        }
        
        // 检查宫格
        const boxSize = Math.sqrt(this.gridSize);
        for (let boxRow = 0; boxRow < this.gridSize; boxRow += boxSize) {
            for (let boxCol = 0; boxCol < this.gridSize; boxCol += boxSize) {
                const boxSet = new Set();
                for (let i = 0; i < boxSize; i++) {
                    for (let j = 0; j < boxSize; j++) {
                        const num = board[boxRow + i][boxCol + j];
                        if (num === 0) continue;
                        if (boxSet.has(num)) {
                            console.error(`宫格(${Math.floor(boxRow/boxSize) + 1},${Math.floor(boxCol/boxSize) + 1})有重复数字: ${num}`);
                            return false;
                        }
                        boxSet.add(num);
                    }
                }
            }
        }
        
        return true;
    }

    toggleNoteMode() {
        this.isNoteMode = !this.isNoteMode;
        const noteModeBtn = document.getElementById('note-mode-btn');
        if (noteModeBtn) {
            if (this.isNoteMode) {
                noteModeBtn.classList.add('active');
                noteModeBtn.textContent = '📝 笔记模式';
                this.showMessage('已切换到笔记模式，点击数字添加笔记', 'info');
            } else {
                noteModeBtn.classList.remove('active');
                noteModeBtn.textContent = '📝 笔记';
                this.showMessage('已切换到正常模式', 'info');
            }
        }
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

        if (this.isNoteMode) {
            // 笔记模式
            if (number === 0) {
                // 清除该单元格的所有笔记
                this.clearNotes(row, col);
                this.updateCellDisplay(row, col);
            } else {
                // 切换笔记
                this.toggleNote(row, col, number);
            }
        } else {
            // 正常模式
            if (number === 0) {
                // 清除单元格
                this.board[row][col] = 0;
                this.clearNotes(row, col);
                this.updateCellDisplay(row, col);
            } else {
                // 放置数字
                this.board[row][col] = number;
                this.clearNotes(row, col); // 放置数字时清除笔记
                this.updateCellDisplay(row, col);
                
                // 实时验证数独规则
                const validation = this.validateSudokuRules(this.board);
                if (!validation.valid) {
                    this.selectedCell.classList.add('error');
                    this.showMessage(`数独规则冲突：${validation.type === 'row' ? '行' : validation.type === 'column' ? '列' : '宫格'}中有重复数字！`, 'error');
                }
            }
        }
    }

    toggleNote(row, col, number) {
        if (number === 0) return; // 笔记模式下不处理0
        
        const noteKey = `${row}-${col}`;
        if (!this.notes[noteKey]) {
            this.notes[noteKey] = [];
        }
        
        const noteIndex = this.notes[noteKey].indexOf(number);
        if (noteIndex > -1) {
            // 如果笔记已存在，则移除
            this.notes[noteKey].splice(noteIndex, 1);
            console.log(`移除笔记: 第${row+1}行第${col+1}列的数字${number}`);
        } else {
            // 如果笔记不存在，则添加
            this.notes[noteKey].push(number);
            this.notes[noteKey].sort((a, b) => a - b); // 排序
            console.log(`添加笔记: 第${row+1}行第${col+1}列的数字${number}`);
        }
        
        console.log(`当前笔记: ${JSON.stringify(this.notes[noteKey])}`);
        this.updateCellDisplay(row, col);
    }

    clearNotes(row, col) {
        const noteKey = `${row}-${col}`;
        if (this.notes[noteKey]) {
            delete this.notes[noteKey];
        }
    }

    updateCellDisplay(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) {
            console.error(`找不到单元格: 第${row+1}行第${col+1}列`);
            return;
        }
        
        const value = this.board[row][col];
        const noteKey = `${row}-${col}`;
        const notes = this.notes[noteKey] || [];
        
        console.log(`更新单元格显示: 第${row+1}行第${col+1}列，值: ${value}，笔记: ${JSON.stringify(notes)}`);
        
        // 清除之前的显示
        cell.textContent = '';
        
        // 查找或创建笔记容器
        let notesContainer = cell.querySelector('.notes-container');
        if (!notesContainer) {
            console.log(`笔记容器不存在，正在创建...`);
            notesContainer = document.createElement('div');
            notesContainer.className = 'notes-container';
            cell.appendChild(notesContainer);
            console.log(`已创建笔记容器`);
        }
        
        notesContainer.innerHTML = '';
        
        if (value !== 0) {
            // 显示主数字
            cell.textContent = value;
            console.log(`显示主数字: ${value}`);
        } else if (notes.length > 0) {
            // 显示笔记
            console.log(`准备显示笔记: ${JSON.stringify(notes)}`);
            this.displayNotes(cell, notes);
        } else {
            console.log(`单元格为空，无笔记`);
        }
        
        // 更新样式
        cell.classList.remove('error', 'correct');
        if (value !== 0) {
            // 只检查当前格子是否与行、列、宫格中的其他数字冲突
            if (!this.isValid(this.board, row, col, value)) {
                cell.classList.add('error');
            }
        }
    }

    displayNotes(cell, notes) {
        const notesContainer = cell.querySelector('.notes-container');
        if (!notesContainer) {
            console.error('找不到笔记容器');
            return;
        }
        
        notesContainer.innerHTML = '';
        console.log(`显示笔记: ${JSON.stringify(notes)}`);
        
        // 创建笔记网格
        for (let i = 1; i <= this.gridSize; i++) {
            const noteElement = document.createElement('span');
            noteElement.className = 'note-number';
            noteElement.textContent = notes.includes(i) ? i : '';
            notesContainer.appendChild(noteElement);
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