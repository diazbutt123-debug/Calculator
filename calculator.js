console.log("Calculator script loaded");

const display = document.getElementById("result");
const expression = document.getElementById("expression");

let currentValue = "0";
let previousValue = "";
let operator = null;
let shouldResetDisplay = false;
let justCalculated = false;

function updateDisplay(value) {
    // Shorten very long numbers
    let displayVal = value;
    if (!isNaN(value) && value !== "Error") {
        let num = parseFloat(value);
        if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
            displayVal = num.toExponential(4);
        } else {
            // Limit decimals shown
            displayVal = parseFloat(parseFloat(value).toPrecision(12)).toString();
        }
    }
    display.textContent = displayVal;
    display.className = "result";
    if (displayVal.length > 10) display.classList.add("small");
    if (displayVal === "Error") display.classList.add("error");
}

function pulseDisplay() {
    display.classList.remove("pulse");
    void display.offsetWidth;
    display.classList.add("pulse");
}

function setActiveOperator(op) {
    document.querySelectorAll(".btn-operator").forEach(btn => btn.classList.remove("active"));
    if (op) {
        document.querySelectorAll(".btn-operator").forEach(btn => {
            if (btn.dataset.value === op) btn.classList.add("active");
        });
    }
}

function calculate(a, b, op) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
        case "+":  return a + b;
        case "−":  return a - b;
        case "×":  return a * b;
        case "÷":
            if (b === 0) return "Error";
            return a / b;
        default: return b;
    }
}

function handleNumber(value) {
    if (justCalculated && !shouldResetDisplay) {
        // Starting a new calculation after equals
        currentValue = value;
        previousValue = "";
        operator = null;
        expression.textContent = "";
        justCalculated = false;
        updateDisplay(currentValue);
        return;
    }

    if (shouldResetDisplay) {
        currentValue = value;
        shouldResetDisplay = false;
    } else {
        if (currentValue === "0" && value !== ".") {
            currentValue = value;
        } else if (currentValue.length < 15) {
            currentValue += value;
        }
    }
    updateDisplay(currentValue);
}

function handleDecimal() {
    if (shouldResetDisplay) {
        currentValue = "0.";
        shouldResetDisplay = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }
    updateDisplay(currentValue);
}

function handleOperator(op) {
    justCalculated = false;
    setActiveOperator(op);

    if (operator && !shouldResetDisplay) {
        // Chain operations
        const result = calculate(previousValue, currentValue, operator);
        if (result === "Error") {
            currentValue = "Error";
            operator = null;
            previousValue = "";
            expression.textContent = "Cannot divide by zero";
            updateDisplay("Error");
            pulseDisplay();
            return;
        }
        currentValue = String(parseFloat(result.toPrecision(12)));
        updateDisplay(currentValue);
    }

    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;
    expression.textContent = `${parseFloat(previousValue)} ${op}`;
}

function handleEquals() {
    if (!operator || shouldResetDisplay) return;

    const a = previousValue;
    const b = currentValue;
    const op = operator;

    expression.textContent = `${parseFloat(a)} ${op} ${parseFloat(b)} =`;

    const result = calculate(a, b, op);
    if (result === "Error") {
        currentValue = "Error";
        expression.textContent = "Cannot divide by zero";
        updateDisplay("Error");
        pulseDisplay();
        operator = null;
        previousValue = "";
        shouldResetDisplay = true;
        return;
    }

    currentValue = String(parseFloat(result.toPrecision(12)));
    operator = null;
    shouldResetDisplay = true;
    justCalculated = true;

    setActiveOperator(null);
    pulseDisplay();
    updateDisplay(currentValue);
}

function handleClear() {
    currentValue = "0";
    previousValue = "";
    operator = null;
    shouldResetDisplay = false;
    justCalculated = false;
    expression.textContent = "";
    setActiveOperator(null);
    updateDisplay("0");
}

function handleSign() {
    if (currentValue !== "0" && currentValue !== "Error") {
        currentValue = String(parseFloat(currentValue) * -1);
        updateDisplay(currentValue);
    }
}

function handlePercent() {
    if (currentValue !== "Error") {
        currentValue = String(parseFloat(currentValue) / 100);
        updateDisplay(currentValue);
    }
}

// Button click handling
document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        switch (action) {
            case "number":   handleNumber(value); break;
            case "decimal":  handleDecimal(); break;
            case "operator": handleOperator(value); break;
            case "equals":   handleEquals(); break;
            case "clear":    handleClear(); break;
            case "sign":     handleSign(); break;
            case "percent":  handlePercent(); break;
        }
    });
});

// Keyboard support
const keyMap = {
    "0":"0","1":"1","2":"2","3":"3","4":"4",
    "5":"5","6":"6","7":"7","8":"8","9":"9",
    "+":"+", "-":"−", "*":"×", "/":"÷",
    "Enter":"=", "=":"=", ".":".",
    "Escape":"AC", "Backspace":"back", "%":"%"
};

document.addEventListener("keydown", (e) => {
    const mapped = keyMap[e.key];
    if (!mapped) return;
    e.preventDefault();

    if (mapped === "AC") { handleClear(); return; }
    if (mapped === "=") { handleEquals(); return; }
    if (mapped === ".") { handleDecimal(); return; }
    if (mapped === "%") { handlePercent(); return; }
    if (mapped === "back") {
        if (currentValue.length > 1) {
            currentValue = currentValue.slice(0, -1);
        } else {
            currentValue = "0";
        }
        updateDisplay(currentValue);
        return;
    }
    if (["÷","×","−","+"].includes(mapped)) { handleOperator(mapped); return; }
    handleNumber(mapped);
});

// Initial render
updateDisplay("0");
