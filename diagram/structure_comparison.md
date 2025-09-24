# Structural Comparison: diagram.html vs circles-arc-diagram.html

## Overview
Both files follow a similar overall structure but there are key differences in where certain elements are created and how the code is organized within the main loop.

## Main Loop Structure (for i = 0 to numCircles)

### Elements Created INSIDE the Main Loop

#### Both Files:
1. **Dot positioning calculations** - Group logic for spacing (Groups 1-6)
2. **Individual dots (circles)** - All 100 dots with their colors and sizes
3. **Lines from center to dots** - Blue/orange lines radiating from center
4. **Dot labels** - Labels for specific banks (e.g., Citibank at index 1, HSBC at 45)
5. **Orange dots and lines** - For dots 45-49 (HSBC/ING group)
6. **Dot position storage** - `window.dotPositions[i] = { x, y }`

#### Elements Created ONLY Inside `if (i === 0)` Block:
1. **Black background circle** - Large black circle behind RBA dot
2. **RBA text label** - "RBA" text next to first dot
3. **SWIFT PDS rectangle** - Main SWIFT box
4. **SWIFT text** - "SWIFT" and "PDS" text in two lines
5. **SWIFT HVCS elements**:
   - Three pacs boxes (pacs.002, pacs.009, pacs.004)
   - SWIFT HVCS bounding box
   - SWIFT HVCS label
   - Horizontal line from SWIFT HVCS
6. **Austraclear box** - Below CHESS-RTGS
7. **CHESS-RTGS box** - Above Austraclear
8. **DvP RTGS and RTGS boxes** - To the left of Austraclear
9. **Money Market boxes** - Six boxes to the left of DvP RTGS
10. **ASX boxes and bounding box** - Including ASX, Clearing, and Settlement boxes
11. **CLS AUD box** - Above SWIFT PDS
12. **NPP BI (SWIFT) box** - Below SWIFT PDS
13. **Various connecting lines**:
    - Lines from DvP/RTGS to CHESS/Austraclear
    - Lines from pacs boxes to SWIFT PDS
    - Lines from SWIFT PDS to CLS AUD and NPP

### Elements Created OUTSIDE the Main Loop

#### After the Loop Completes:
1. **BDF square** - For dots 50-53 (Big 4 banks) with kinked lines
2. **Yellow rectangle** - "International Banks" box around dots 1-2
3. **Green border rectangle** - "CS" box around dots 96-98
4. **Other group rectangles**:
   - Domestic Banks (dots 3-44)
   - Specialised ADIs (dots 84-91)
5. **ESA and System Cash rectangles** - Right side elements
6. **Cheques box** - Below NPP
7. **NPP Payments box** - Left of NPP
8. **Final position adjustments** - Updates to SWIFT HVCS and other elements
9. **Sigmoid curve** - From CLS dot (only in circles-arc-diagram.html)
10. **"no connection to CLS" text** - (only in circles-arc-diagram.html)

## Key Structural Differences

### 1. **Element Creation Timing**
- **diagram.html**: Most SWIFT-related elements are created inside `if (i === 0)`
- **circles-arc-diagram.html**: Similar structure but includes sigmoid curve creation after loop

### 2. **Scope and Variable Access**
- Variables defined inside `if (i === 0)` are only accessible within that block
- Global storage via `window.*` is used extensively to share data between loop iterations and post-loop code
- Examples: `window.dotPositions`, `window.swiftHvcsElements`, `window.clsEndpoints`

### 3. **Dependency Management**
- Elements created after the loop depend on dot positions collected during the loop
- BDF square needs positions of dots 50-53
- Group rectangles need min/max positions of their respective dot groups
- Position adjustments happen after all base elements are created

### 4. **Layering Strategy**
- Background elements (rectangles) are inserted into specific groups
- Lines are added to dedicated line groups (blueLinesGroup, orangeLinesGroup)
- Labels are added to labelsGroup to ensure they appear on top

### 5. **Nesting Hierarchy**
```
SVG Root
├── defs (gradients, patterns)
├── background-elements group
│   ├── Group rectangles (Domestic Banks, etc.)
│   └── SWIFT HVCS bounding box
├── orangeLinesGroup
├── blueLinesGroup  
├── circlesGroup (dots)
├── labelsGroup (all text labels)
└── Individual paths (sigmoid curve, etc.)
```

### 6. **Major Code Organization Difference**
The most significant difference is that **diagram.html omits the sigmoid curve creation** that connects the CLS dot to the FSS/NPP area, while **circles-arc-diagram.html includes it**.

## Variable Scope Issues to Watch For

1. **Variables declared inside `if (i === 0)`**:
   - Only accessible within that block
   - Must use `window.*` for data needed later

2. **Variables declared inside loop but outside `if`**:
   - Accessible for current iteration only
   - Lost after each iteration unless stored globally

3. **Post-loop code dependencies**:
   - Relies heavily on `window.*` variables set during loop
   - Must check for existence before use

## Initialization Order Critical Points

1. First, the loop creates all dots and collects positions
2. During `i === 0`, major infrastructure elements are created
3. After loop completes, group rectangles are created using collected positions
4. Final adjustments and alignments are made
5. Any element using another's position must be created after that element exists