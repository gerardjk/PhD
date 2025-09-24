# CRITICAL REMINDERS - READ BEFORE EVERY EDIT

## ⚠️ STOP! CHECK THESE BEFORE WRITING ANY CODE ⚠️

### 🔴 #1 RULE: NEVER USE UNDEFINED VARIABLES

## 🚨🚨🚨 CRITICAL: UNDEFINED VARIABLE ERRORS 🚨🚨🚨
## ❌❌❌ STOP USING VARIABLES BEFORE THEY'RE DEFINED! ❌❌❌

**YOU KEEP MAKING THIS MISTAKE OVER AND OVER!** 

### LATEST MISTAKE: Used `narrowBoxWidth` before it was defined (Line 1267 before Line 1466)!

## 🛑 AFTER EVERY EDIT: CHECK YOURSELF!
After making ANY edit that uses variables:
1. Look at EVERY variable you used
2. Use Grep to find where it's defined
3. Check the line numbers - is it defined BEFORE you use it?
4. If not, DON'T COMMIT THE EDIT!

### 🚨 CHECK FOR INITIALIZATION ERRORS 🚨
**AFTER EVERY EDIT - MANDATORY CHECKS:**
1. **No variables are used before they're declared** (ReferenceError)
2. **No const/let variables are accessed before initialization** (Cannot access before initialization)
3. **Variables are accessible in the scope where they're used**
4. **Run the code mentally** to ensure no temporal dead zones

Common error patterns:
```javascript
// ERROR: Cannot access 'gap' before initialization
const height = baseHeight + gap;  // Line 100
const gap = 10;                   // Line 101

// ERROR: ReferenceError - variable not defined yet
const total = width + margin;     // Line 200
// ... 100 lines later ...
const margin = 20;                // Line 300
```

**MANDATORY STEPS** Before using ANY variable:
1. **GREP FOR IT FIRST** - Search the ENTIRE file for where it's defined
2. **CHECK SCOPE** - Variables defined inside blocks are NOT accessible outside
3. **VERIFY THE EXACT NAME** - Don't assume, ALWAYS verify

### Recent Mistakes You've Made:
- Used `rtgsX` when it should be `dvpRtgsX`
- Used `updatedBridgeX` outside its scope
- Used variables before they were defined
- Used `chequesBoxWidth` 650 lines before it was defined
- Used `mastercardRightEdge` outside its scope
- Used variables without checking if they exist first

### THE SOLUTION:
**BEFORE WRITING ANY CODE THAT USES A VARIABLE:**
```
1. Use Grep tool: grep "variableName ="
2. Check if it's in the same scope
3. If not found, DON'T USE IT
4. Create it or find the correct name
```
Before using ANY variable in your code:
1. **SEARCH** for where it's defined (use Grep tool)
2. **VERIFY** the exact variable name 
3. **CHECK** if it's accessible in your current scope

### Common Variable Name Mistakes:
- Using `rtgsX` when it's actually `dvpRtgsX`
- Using generic names that don't exist
- Assuming a variable exists without checking

## JavaScript Variable Declaration Errors

### ALWAYS CHECK FOR EXISTING VARIABLE DECLARATIONS

Before declaring any `const` or `let` variable, **ALWAYS** search the file to ensure the variable name hasn't already been used. JavaScript does not allow redeclaration of variables in the same scope.

#### Common Mistakes to Avoid:
1. **Redeclaring const variables** - This causes `SyntaxError: redeclaration of const [variable]`
2. **Using generic variable names** that might already exist elsewhere in the code
3. **Copy-pasting code blocks** without checking if variable names conflict

#### Best Practices:
1. **Use unique, descriptive variable names** when adding new calculations
2. **Add suffixes to distinguish similar calculations** (e.g., `sssCcpY_forAsxf` instead of reusing `sssCcpY`)
3. **Search the file first** using Grep or Read before declaring variables with common names
4. **When in doubt, use more specific names** rather than generic ones

#### Example of the Error:
```javascript
// Line 975
const sssCcpY = moneyMarketY - smallRectHeight - verticalGap;

// Line 1094 - WRONG! This causes redeclaration error
const sssCcpY = moneyMarketY - smallRectHeight - verticalGap;

// Line 1094 - CORRECT! Use a unique name
const sssCcpY_calc = moneyMarketY - smallRectHeight - verticalGap;
```

### Variable Scope Awareness
Remember that `const` and `let` are block-scoped. Even if variables look like they're in different sections, if they're in the same function or global scope, they cannot be redeclared.

## Before Making Any Edit:
1. **Read the surrounding code** to understand existing variable names
2. **Search for the variable name** you plan to use
3. **Choose unique, descriptive names** for new variables
4. **Test mentally** that your changes won't cause redeclaration errors
5. **Check variable initialization order** - ensure variables are used AFTER they're declared

## Variable Initialization Order Errors

### ALWAYS CHECK THAT VARIABLES ARE DECLARED BEFORE USE

JavaScript requires variables to be declared before they can be used. Using a variable before its declaration causes a `ReferenceError`.

#### Common Mistakes:
1. **Using variables in calculations before they're declared**
2. **Moving code blocks without checking dependencies**
3. **Creating circular dependencies between variable declarations**

#### Best Practice:
When you need to use a variable that's declared later in the code:
1. **Use placeholder values** and update them after the dependency is available
2. **Move the dependent code** to after all required variables are declared
3. **Document the dependency** with a comment

#### Example:
```javascript
// WRONG - moneyMarketY used before declaration
const bridgeY = moneyMarketY - 50;
// ... later in code ...
const moneyMarketY = 100;

// CORRECT - use placeholder then update
let bridgeY = 0; // Placeholder - will update after moneyMarketY is defined
// ... later in code ...
const moneyMarketY = 100;
// Now update bridgeY with the correct value
bridgeY = moneyMarketY - 50;
```