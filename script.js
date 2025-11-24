class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
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

    appendNumber(number) {
        if (this.resetScreen) {
            this.currentOperand = '';
            this.resetScreen = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;

        this.operationBuffer.push(parseFloat(this.currentOperand));
        this.operationBuffer.push(operation);
        
        this.currentOperand = '';
    }

    compute() {
        if (this.currentOperand === '' && this.operationBuffer.length === 0) return;

        if (this.currentOperand !== '') {
            this.operationBuffer.push(parseFloat(this.currentOperand));
        }

        let tempBuffer = [];
        let i = 0;

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
                        alert("Tidak bisa membagi dengan nol!");
                        this.clear();
                        this.updateDisplay();
                        return;
                    }
                    result = prevNum / nextNum;
                }

                tempBuffer.push(result);
                i += 2; 
            } else {
                tempBuffer.push(currentItem);
                i++;
            }
        }

        let finalResult = tempBuffer[0];

        for (let j = 1; j < tempBuffer.length; j += 2) {
            let operator = tempBuffer[j];
            let nextNum = tempBuffer[j + 1];

            if (operator === '+') {
                finalResult += nextNum;
            } else if (operator === '-') {
                finalResult -= nextNum;
            }
        }

        this.currentOperand = finalResult;
        this.operationBuffer = [];
        this.resetScreen = true;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
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

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-action="calculate"]');
const clearButton = document.querySelector('[data-action="clear"]');
const clearEntryButton = document.querySelector('[data-action="clear-entry"]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

if (clearEntryButton) {
    clearEntryButton.addEventListener('click', button => {
        calculator.clearEntry();
        calculator.updateDisplay();
    });
}