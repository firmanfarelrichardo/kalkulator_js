class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, historyListElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.historyListElement = historyListElement;
        
        this.memory = 0;
        this.history = [];
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.operationBuffer = [];
        this.resetScreen = false;
    }

    clearEntry() {
        this.currentOperand = '';
    }

    delete() {
        if (this.resetScreen) return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.resetScreen) {
            this.currentOperand = '';
            this.resetScreen = false;
        }
        
        // Handle leading dot: input "." becomes "0."
        if (number === '.') {
            if (this.currentOperand.includes('.')) return;
            if (this.currentOperand === '') {
                this.currentOperand = '0.';
                return;
            }
        }

        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        // Support Unary Minus (Negative numbers at start)
        if (this.currentOperand === '') {
            if (operation === '-') {
                this.currentOperand = '-';
                return;
            }
            return;
        }

        // Prevent operator input if screen only has "-"
        if (this.currentOperand === '-') return;

        this.operationBuffer.push(parseFloat(this.currentOperand));
        this.operationBuffer.push(operation);
        this.currentOperand = '';
    }

    compute() {
        if (this.currentOperand === '' && this.operationBuffer.length === 0) return;
        if (this.currentOperand === '-') return; 

        // 1. Create Expression String for History (Before calculation)
        let expressionString = this.operationBuffer.join(' ') + ' ' + this.currentOperand;

        if (this.currentOperand !== '') {
            this.operationBuffer.push(parseFloat(this.currentOperand));
        }

        // 2. PEMDAS Logic Implementation
        let tempBuffer = [];
        let i = 0;

        // Pass 1: Multiplication and Division
        while (i < this.operationBuffer.length) {
            let currentItem = this.operationBuffer[i];
            
            if (currentItem === '×' || currentItem === '÷') {
                let prevNum = tempBuffer.pop();
                let nextNum = this.operationBuffer[i + 1];
                let result;

                if (currentItem === '×') {
                    result = prevNum * nextNum;
                } else if (currentItem === '÷') {
                    if (nextNum === 0) {
                        alert("Error: Division by Zero");
                        this.clear();
                        this.updateDisplay();
                        return;
                    }
                    result = prevNum / nextNum;
                }
                
                // Fix floating point precision (e.g. 0.1 + 0.2)
                tempBuffer.push(parseFloat(result.toPrecision(12)));
                i += 2; 
            } else {
                tempBuffer.push(currentItem);
                i++;
            }
        }

        // Pass 2: Addition and Subtraction
        let finalResult = tempBuffer[0];
        for (let j = 1; j < tempBuffer.length; j += 2) {
            let operator = tempBuffer[j];
            let nextNum = tempBuffer[j + 1];
            
            if (operator === '+') finalResult += nextNum;
            else if (operator === '-') finalResult -= nextNum;
        }

        // Final precision check
        finalResult = parseFloat(finalResult.toPrecision(12));

        // 3. Save to History
        this.addToHistory(expressionString, finalResult);

        this.currentOperand = finalResult;
        this.operationBuffer = [];
        this.resetScreen = true;
    }

    // --- MEMORY FUNCTIONS ---
    memoryClear() {
        this.memory = 0;
        // Visual Feedback (Flash "MC")
        const prev = this.currentOperandTextElement.innerText;
        this.currentOperandTextElement.innerText = "Mem Clr";
        setTimeout(() => this.updateDisplay(), 600);
    }

    memoryRecall() {
        this.currentOperand = this.memory;
        this.resetScreen = true;
    }

    memoryPlus() {
        if (this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.memory += current;
        this.resetScreen = true;
        
        // Visual Feedback
        this.currentOperandTextElement.innerText = "Saved";
        setTimeout(() => this.updateDisplay(), 400);
    }

    memoryMinus() {
        if (this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.memory -= current;
        this.resetScreen = true;
        
        // Visual Feedback
        this.currentOperandTextElement.innerText = "Saved";
        setTimeout(() => this.updateDisplay(), 400);
    }

    // --- HISTORY FUNCTIONS ---
    addToHistory(expression, result) {
        this.history.unshift({ expression, result });
        
        // Maintain only 5 items
        if (this.history.length > 5) {
            this.history.pop();
        }
        
        this.updateHistoryUI();
    }

    updateHistoryUI() {
        this.historyListElement.innerHTML = '';
        
        this.history.forEach(item => {
            const li = document.createElement('li');
            li.className = "bg-white p-3 rounded-lg shadow-sm border border-gray-200 animate-[fadeIn_0.3s_ease-out]";
            li.innerHTML = `
                <div class="text-right text-xs text-gray-500 font-mono mb-1 tracking-wider">${item.expression}</div>
                <div class="text-right text-lg font-bold text-gray-800 font-mono border-t border-dashed border-gray-300 pt-1">= ${this.getDisplayNumber(item.result)}</div>
            `;
            this.historyListElement.appendChild(li);
        });
    }

    getDisplayNumber(number) {
        if (number === '-') return '-'; 
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) integerDisplay = '';
        else integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });

        if (decimalDigits != null) return `${integerDisplay}.${decimalDigits}`;
        else return integerDisplay;
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operationBuffer.length > 0) {
            this.previousOperandTextElement.innerText = this.operationBuffer.join(' ');
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// --- DOM INITIALIZATION ---
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');
const historyListElement = document.getElementById('history-list');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement);

// --- EVENT LISTENERS ---

// Numbers
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

// Operations
document.querySelectorAll('[data-operation]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

// Calculate
document.querySelector('[data-action="calculate"]').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Clear
document.querySelector('[data-action="clear"]').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Clear Entry
document.querySelector('[data-action="clear-entry"]').addEventListener('click', () => {
    calculator.clearEntry();
    calculator.updateDisplay();
});

// Memory Buttons
document.querySelector('[data-action="memory-plus"]').addEventListener('click', () => calculator.memoryPlus());
document.querySelector('[data-action="memory-minus"]').addEventListener('click', () => calculator.memoryMinus());
document.querySelector('[data-action="memory-recall"]').addEventListener('click', () => {
    calculator.memoryRecall();
    calculator.updateDisplay();
});
document.querySelector('[data-action="memory-clear"]').addEventListener('click', () => calculator.memoryClear());

// History Panel Toggle
const historyPanel = document.getElementById('history-panel');
const toggleHistoryBtn = document.getElementById('toggle-history');
const closeHistoryBtn = document.getElementById('close-history');

toggleHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.remove('-translate-x-full');
});

closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.add('-translate-x-full');
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) {
        calculator.appendNumber(e.key);
    } 
    else if (e.key === '.') {
        calculator.appendNumber('.');
    } 
    else if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
    } 
    else if (e.key === 'Backspace') {
        calculator.delete();
    } 
    else if (e.key === 'Escape') {
        calculator.clear();
    } 
    else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let op = e.key;
        if (op === '/') op = '÷';
        if (op === '*') op = '×';
        calculator.chooseOperation(op);
    }
    
    calculator.updateDisplay();
});