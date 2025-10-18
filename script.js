const columnsSlider = document.getElementById('columns');
const columnsValue = document.getElementById('columns-value');
const rowsSlider = document.getElementById('rows');
const rowsValue = document.getElementById('rows-value');
const columnGapSlider = document.getElementById('column-gap');
const columnGapValue = document.getElementById('column-gap-value');
const rowGapSlider = document.getElementById('row-gap');
const rowGapValue = document.getElementById('row-gap-value');
const gridPreview = document.getElementById('grid-preview');
const htmlCode = document.getElementById('html-code');
const cssCode = document.getElementById('css-code');
const copyHtmlBtn = document.getElementById('copy-html-btn');
const copyCssBtn = document.getElementById('copy-css-btn');
const addItemBtn = document.getElementById('add-item-btn');
const resetBtn = document.getElementById('reset-btn');
const clearBtn = document.getElementById('clear-btn');
const showGridLinesCheckbox = document.getElementById('show-grid-lines');
const templateButtons = document.querySelectorAll('.template-button');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file-input');
const itemPropertiesPanel = document.getElementById('item-properties-panel');
const selectedItemIdSpan = document.getElementById('selected-item-id');
const closePanelBtn = document.getElementById('close-panel-btn');
const propColStart = document.getElementById('prop-col-start');
const propColEnd = document.getElementById('prop-col-end');
const propRowStart = document.getElementById('prop-row-start');
const propRowEnd = document.getElementById('prop-row-end');
const applyPropertiesBtn = document.getElementById('apply-properties-btn');
const helpButton = document.getElementById('help-button');
const aboutDialog = document.getElementById('about-dialog');
const closeAboutBtn = document.getElementById('close-about-btn');

const DEFAULT_STATE = {
    columns: 5,
    rows: 6,
    columnGap: 6,
    rowGap: 6
};

let gridState = { ...DEFAULT_STATE };

let gridItems = [];
let itemIdCounter = 1;
let draggedItem = null;
let resizingItem = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartColSpan = 1;
let resizeStartRowSpan = 1;
let showGridLines = true;
let selectedItem = null;

function init() {
    bindEventListeners();
    
    addGridItem(1, 1, 1, 1);
    addGridItem(2, 1, 1, 1);
    addGridItem(1, 2, 1, 1);
    
    initSliders();
    
    updateGrid();
}

function initSliders() {
    updateSliderFill(columnsSlider);
    updateSliderFill(rowsSlider);
    updateSliderFill(columnGapSlider);
    updateSliderFill(rowGapSlider);
}

function updateSliderFill(slider) {
    const value = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-value', `${percentage}%`);
}

class GridItem {
    constructor(id, colStart, rowStart, colSpan = 1, rowSpan = 1) {
        this.id = id;
        this.colStart = colStart;
        this.rowStart = rowStart;
        this.colSpan = colSpan;
        this.rowSpan = rowSpan;
    }
    
    get colEnd() {
        return this.colStart + this.colSpan;
    }
    
    get rowEnd() {
        return this.rowStart + this.rowSpan;
    }
}

function addGridItem(colStart, rowStart, colSpan = 1, rowSpan = 1) {
    const item = new GridItem(itemIdCounter++, colStart, rowStart, colSpan, rowSpan);
    gridItems.push(item);
    return item;
}

function removeGridItem(id) {
    gridItems = gridItems.filter(item => item.id !== id);
    updateGrid();
}

function findEmptyPosition() {
    const { columns, rows } = gridState;
    
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
            const tempItem = {
                id: -1,
                colStart: col,
                rowStart: row,
                colSpan: 1,
                rowSpan: 1,
                get colEnd() { return this.colStart + this.colSpan; },
                get rowEnd() { return this.rowStart + this.rowSpan; }
            };
            
            const hasOverlap = gridItems.some(item => checkOverlap(tempItem, item));
            
            if (!hasOverlap) {
                return { col, row };
            }
        }
    }
    
    return { col: 1, row: 1 };
}

function bindEventListeners() {
    columnsSlider.addEventListener('input', (e) => {
        if (draggedItem) return;
        const value = parseInt(e.target.value);
        columnsValue.value = value;
        gridState.columns = value;
        updateSliderFill(e.target);
        updateGrid();
    });
    
    columnsValue.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 12) {
            columnsSlider.value = value;
            gridState.columns = value;
            updateGrid();
        }
    });
    
    rowsSlider.addEventListener('input', (e) => {
        if (draggedItem) return;
        const value = parseInt(e.target.value);
        rowsValue.value = value;
        gridState.rows = value;
        updateSliderFill(e.target);
        updateGrid();
    });
    
    rowsValue.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 12) {
            rowsSlider.value = value;
            gridState.rows = value;
            updateGrid();
        }
    });
    
    columnGapSlider.addEventListener('input', (e) => {
        if (draggedItem) return;
        const value = parseInt(e.target.value);
        columnGapValue.value = value;
        gridState.columnGap = value;
        updateSliderFill(e.target);
        updateGrid();
    });
    
    columnGapValue.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 0 && value <= 50) {
            columnGapSlider.value = value;
            gridState.columnGap = value;
            updateGrid();
        }
    });
    
    rowGapSlider.addEventListener('input', (e) => {
        if (draggedItem) return;
        const value = parseInt(e.target.value);
        rowGapValue.value = value;
        gridState.rowGap = value;
        updateSliderFill(e.target);
        updateGrid();
    });
    
    rowGapValue.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 0 && value <= 50) {
            rowGapSlider.value = value;
            gridState.rowGap = value;
            updateGrid();
        }
    });
    
    addItemBtn.addEventListener('click', () => {
        const pos = findEmptyPosition();
        addGridItem(pos.col, pos.row, 1, 1);
        updateGrid();
    });
    
    copyHtmlBtn.addEventListener('click', () => copyToClipboard('html'));
    copyCssBtn.addEventListener('click', () => copyToClipboard('css'));
    
    resetBtn.addEventListener('click', resetAll);
    
    clearBtn.addEventListener('click', clearAllItems);
    
    showGridLinesCheckbox.addEventListener('change', (e) => {
        showGridLines = e.target.checked;
        toggleGridLines();
    });
    
    templateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;
            applyTemplate(template);
        });
    });
    
    exportBtn.addEventListener('click', exportConfiguration);
    
    importBtn.addEventListener('click', () => {
        importFileInput.click();
    });
    
    importFileInput.addEventListener('change', importConfiguration);
    
    closePanelBtn.addEventListener('click', closePropertiesPanel);
    
    applyPropertiesBtn.addEventListener('click', applyPropertyChanges);
    
    helpButton.addEventListener('click', showAboutDialog);
    closeAboutBtn.addEventListener('click', closeAboutDialog);
    
    aboutDialog.querySelector('.about-dialog-overlay').addEventListener('click', closeAboutDialog);
}

function resetAll() {
    gridState = { ...DEFAULT_STATE };
    
    columnsSlider.value = DEFAULT_STATE.columns;
    columnsValue.value = DEFAULT_STATE.columns;
    rowsSlider.value = DEFAULT_STATE.rows;
    rowsValue.value = DEFAULT_STATE.rows;
    columnGapSlider.value = DEFAULT_STATE.columnGap;
    columnGapValue.value = DEFAULT_STATE.columnGap;
    rowGapSlider.value = DEFAULT_STATE.rowGap;
    rowGapValue.value = DEFAULT_STATE.rowGap;
    
    gridItems = [];
    itemIdCounter = 1;
    
    addGridItem(1, 1, 1, 1);
    addGridItem(2, 1, 1, 1);
    addGridItem(1, 2, 1, 1);
    
    updateGrid();
}

async function clearAllItems() {
    if (gridItems.length === 0) return;
    
    const confirmed = await showConfirmDialog('確定要清空所有網格項目嗎？', '清空項目');
    if (confirmed) {
        gridItems = [];
        updateGrid();
        showNotification('所有項目已清空', 'success');
    }
}

function toggleGridLines() {
    if (showGridLines) {
        gridPreview.classList.add('show-grid-lines');
    } else {
        gridPreview.classList.remove('show-grid-lines');
    }
}

function applyTemplate(templateName) {
    gridItems = [];
    itemIdCounter = 1;
    
    switch (templateName) {
        case 'basic':
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 1, 1);
            addGridItem(2, 1, 1, 1);
            addGridItem(3, 1, 1, 1);
            addGridItem(1, 2, 1, 1);
            addGridItem(2, 2, 1, 1);
            addGridItem(3, 2, 1, 1);
            addGridItem(1, 3, 1, 1);
            addGridItem(2, 3, 1, 1);
            addGridItem(3, 3, 1, 1);
            break;
            
        case 'header-footer':
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 5, 2);
            addGridItem(1, 3, 5, 3);
            addGridItem(1, 6, 5, 1);
            break;
            
        case 'sidebar':
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 5, 1);
            addGridItem(1, 2, 1, 5);
            addGridItem(2, 2, 4, 5);
            break;
            
        case 'holy-grail':
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 5, 1);
            addGridItem(1, 2, 1, 4);
            addGridItem(2, 2, 3, 4);
            addGridItem(5, 2, 1, 4);
            addGridItem(1, 6, 5, 1);
            break;
    }
    
    columnsSlider.value = gridState.columns;
    columnsValue.value = gridState.columns;
    rowsSlider.value = gridState.rows;
    rowsValue.value = gridState.rows;
    
    updateGrid();
}

function updateGrid(skipAnimation = true) {
    const { columns, rows, columnGap, rowGap } = gridState;
    
    adjustItemsToGrid();
    
    gridPreview.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gridPreview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridPreview.style.columnGap = `${columnGap}px`;
    gridPreview.style.rowGap = `${rowGap}px`;
    
    gridPreview.style.setProperty('--grid-columns', columns);
    gridPreview.style.setProperty('--grid-rows', rows);
    
    toggleGridLines();
    
    renderGridItems(skipAnimation);
    
    generateCode();
}

function adjustItemsToGrid() {
    const { columns, rows } = gridState;
    
    gridItems.forEach(item => {
        if (item.colStart > columns) {
            item.colStart = columns;
        }
        if (item.colEnd > columns + 1) {
            item.colSpan = columns - item.colStart + 1;
        }
        
        if (item.rowStart > rows) {
            item.rowStart = rows;
        }
        if (item.rowEnd > rows + 1) {
            item.rowSpan = rows - item.rowStart + 1;
        }
        
        if (item.colSpan < 1) item.colSpan = 1;
        if (item.rowSpan < 1) item.rowSpan = 1;
    });
    
    resolveOverlaps();
}

function resolveOverlaps() {
    const { columns, rows } = gridState;
    
    let maxIterations = 20;
    let hasOverlap = true;
    
    while (hasOverlap && maxIterations > 0) {
        hasOverlap = false;
        
        for (let i = 0; i < gridItems.length; i++) {
            for (let j = i + 1; j < gridItems.length; j++) {
                if (checkOverlap(gridItems[i], gridItems[j])) {
                    hasOverlap = true;
                    
                    const emptyPos = findEmptyPositionForItem(gridItems[j]);
                    if (emptyPos) {
                        gridItems[j].colStart = emptyPos.col;
                        gridItems[j].rowStart = emptyPos.row;
                        
                        if (gridItems[j].colEnd > columns + 1) {
                            gridItems[j].colSpan = columns - gridItems[j].colStart + 1;
                        }
                        if (gridItems[j].rowEnd > rows + 1) {
                            gridItems[j].rowSpan = rows - gridItems[j].rowStart + 1;
                        }
                    } else {
                        if (gridItems[j].colSpan > 1) {
                            gridItems[j].colSpan--;
                        } else if (gridItems[j].rowSpan > 1) {
                            gridItems[j].rowSpan--;
                        }
                    }
                }
            }
        }
        
        maxIterations--;
    }
}

function findEmptyPositionForItem(item) {
    const { columns, rows } = gridState;
    
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
            if (col + item.colSpan - 1 <= columns && row + item.rowSpan - 1 <= rows) {
                const tempItem = {
                    id: item.id,
                    colStart: col,
                    rowStart: row,
                    colSpan: item.colSpan,
                    rowSpan: item.rowSpan,
                    get colEnd() { return this.colStart + this.colSpan; },
                    get rowEnd() { return this.rowStart + this.rowSpan; }
                };
                
                const hasOverlap = gridItems.some(other => 
                    other.id !== item.id && checkOverlap(tempItem, other)
                );
                
                if (!hasOverlap) {
                    return { col, row };
                }
            }
        }
    }
    
    return null;
}

function renderGridItems(skipAnimation = false) {
    gridPreview.innerHTML = '';
    
    gridPreview.addEventListener('dragover', handleDragOver);
    gridPreview.addEventListener('drop', handleDrop);
    
    gridItems.forEach((item, index) => {
        const element = createGridItemElement(item);
        gridPreview.appendChild(element);
        
        if (!skipAnimation) {
            setTimeout(() => {
                element.classList.add('item-enter');
            }, index * 50);
        }
    });
}

function createGridItemElement(item) {
    const element = document.createElement('div');
    element.className = 'grid-item';
    element.dataset.id = item.id;
    element.textContent = item.id;
    element.draggable = true;
    
    element.style.gridColumnStart = item.colStart;
    element.style.gridColumnEnd = item.colEnd;
    element.style.gridRowStart = item.rowStart;
    element.style.gridRowEnd = item.rowEnd;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeGridItem(item.id);
    });
    element.appendChild(deleteBtn);
    
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    element.appendChild(resizeHandle);
    
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        handleResizeStart(e, item);
    });
    
    element.addEventListener('click', (e) => {
        if (!draggedItem && !resizingItem) {
            selectItem(item);
        }
    });
    
    return element;
}

function handleDragStart(e) {
    e.stopPropagation();
    const id = parseInt(e.target.dataset.id);
    draggedItem = gridItems.find(item => item.id === id);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    const rect = e.target.getBoundingClientRect();
    e.dataTransfer.setData('offsetX', e.clientX - rect.left);
    e.dataTransfer.setData('offsetY', e.clientY - rect.top);
}

function handleDragEnd(e) {
    e.stopPropagation();
    e.target.classList.remove('dragging');
    
    if (placeholderElement) {
        placeholderElement.remove();
        placeholderElement = null;
    }
    
    document.querySelectorAll('.grid-item.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    
    setTimeout(() => {
        draggedItem = null;
    }, 100);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem) {
        const gridRect = gridPreview.getBoundingClientRect();
        const x = e.clientX - gridRect.left;
        const y = e.clientY - gridRect.top;
        
        const cellWidth = gridRect.width / gridState.columns;
        const cellHeight = gridRect.height / gridState.rows;
        
        const col = Math.floor(x / cellWidth) + 1;
        const row = Math.floor(y / cellHeight) + 1;
        
        const targetCol = Math.max(1, Math.min(col, gridState.columns));
        const targetRow = Math.max(1, Math.min(row, gridState.rows));
        
        highlightDropTarget(targetCol, targetRow);
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    if (placeholderElement) {
        placeholderElement.remove();
        placeholderElement = null;
    }
    
    const gridRect = gridPreview.getBoundingClientRect();
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;
    
    const cellWidth = gridRect.width / gridState.columns;
    const cellHeight = gridRect.height / gridState.rows;
    
    const col = Math.floor(x / cellWidth) + 1;
    const row = Math.floor(y / cellHeight) + 1;
    
    const targetCol = Math.max(1, Math.min(col, gridState.columns));
    const targetRow = Math.max(1, Math.min(row, gridState.rows));
    
    const targetElement = e.target.closest('.grid-item:not(.drag-placeholder)');
    if (targetElement && targetElement.dataset.id) {
        const targetId = parseInt(targetElement.dataset.id);
        const targetItem = gridItems.find(item => item.id === targetId);
        
        if (targetItem && targetItem.id !== draggedItem.id) {
            swapItems(draggedItem, targetItem);
            updateGrid();
            return;
        }
    }
    
    moveItemToPosition(draggedItem, targetCol, targetRow);
    updateGrid();
}

function swapItems(item1, item2) {
    const tempCol = item1.colStart;
    const tempRow = item1.rowStart;
    const tempColSpan = item1.colSpan;
    const tempRowSpan = item1.rowSpan;
    
    item1.colStart = item2.colStart;
    item1.rowStart = item2.rowStart;
    item1.colSpan = item2.colSpan;
    item1.rowSpan = item2.rowSpan;
    
    item2.colStart = tempCol;
    item2.rowStart = tempRow;
    item2.colSpan = tempColSpan;
    item2.rowSpan = tempRowSpan;
}

function moveItemToPosition(item, targetCol, targetRow) {
    const maxCol = gridState.columns - item.colSpan + 1;
    const maxRow = gridState.rows - item.rowSpan + 1;
    
    const newCol = Math.max(1, Math.min(targetCol, maxCol));
    const newRow = Math.max(1, Math.min(targetRow, maxRow));
    
    if (isValidPosition(item, newCol, newRow, item.colSpan, item.rowSpan)) {
        item.colStart = newCol;
        item.rowStart = newRow;
    } else {
        const nearestPos = findNearestValidPosition(item, newCol, newRow);
        if (nearestPos) {
            item.colStart = nearestPos.col;
            item.rowStart = nearestPos.row;
        }
    }
}

function findNearestValidPosition(item, targetCol, targetRow) {
    const { columns, rows } = gridState;
    let minDistance = Infinity;
    let bestPosition = null;
    
    for (let row = 1; row <= rows - item.rowSpan + 1; row++) {
        for (let col = 1; col <= columns - item.colSpan + 1; col++) {
            if (isValidPosition(item, col, row, item.colSpan, item.rowSpan)) {
                const distance = Math.sqrt(
                    Math.pow(col - targetCol, 2) + Math.pow(row - targetRow, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestPosition = { col, row };
                }
            }
        }
    }
    
    return bestPosition;
}

let placeholderElement = null;

function highlightDropTarget(col, row) {
    if (!draggedItem) return;
    
    if (placeholderElement) {
        placeholderElement.remove();
        placeholderElement = null;
    }
    
    const maxCol = gridState.columns - draggedItem.colSpan + 1;
    const maxRow = gridState.rows - draggedItem.rowSpan + 1;
    
    const targetCol = Math.max(1, Math.min(col, maxCol));
    const targetRow = Math.max(1, Math.min(row, maxRow));
    
    if (!isValidPosition(draggedItem, targetCol, targetRow, draggedItem.colSpan, draggedItem.rowSpan)) {
        return;
    }
    
    placeholderElement = document.createElement('div');
    placeholderElement.className = 'grid-item drag-placeholder';
    placeholderElement.style.gridColumnStart = targetCol;
    placeholderElement.style.gridColumnEnd = targetCol + draggedItem.colSpan;
    placeholderElement.style.gridRowStart = targetRow;
    placeholderElement.style.gridRowEnd = targetRow + draggedItem.rowSpan;
    placeholderElement.style.pointerEvents = 'none';
    
    gridPreview.appendChild(placeholderElement);
}

function checkOverlap(item1, item2) {
    return !(item1.colEnd <= item2.colStart || 
             item1.colStart >= item2.colEnd ||
             item1.rowEnd <= item2.rowStart || 
             item1.rowStart >= item2.rowEnd);
}

function isValidPosition(item, newColStart, newRowStart, newColSpan, newRowSpan) {
    if (newColStart < 1 || newRowStart < 1) return false;
    if (newColStart + newColSpan - 1 > gridState.columns) return false;
    if (newRowStart + newRowSpan - 1 > gridState.rows) return false;
    
    const tempItem = {
        colStart: newColStart,
        rowStart: newRowStart,
        colSpan: newColSpan,
        rowSpan: newRowSpan,
        get colEnd() { return this.colStart + this.colSpan; },
        get rowEnd() { return this.rowStart + this.rowSpan; }
    };
    
    for (let other of gridItems) {
        if (other.id !== item.id && checkOverlap(tempItem, other)) {
            return false;
        }
    }
    
    return true;
}

function handleResizeStart(e, item) {
    e.preventDefault();
    e.stopPropagation();
    
    resizingItem = item;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartColSpan = item.colSpan;
    resizeStartRowSpan = item.rowSpan;
    
    const element = document.querySelector(`[data-id="${item.id}"]`);
    element.classList.add('resizing');
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeMove(e) {
    if (!resizingItem) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;
    
    const colChange = Math.round(deltaX / 100);
    const rowChange = Math.round(deltaY / 80);
    
    const newColSpan = Math.max(1, resizeStartColSpan + colChange);
    const newRowSpan = Math.max(1, resizeStartRowSpan + rowChange);
    
    const maxColSpan = gridState.columns - resizingItem.colStart + 1;
    const maxRowSpan = gridState.rows - resizingItem.rowStart + 1;
    
    const finalColSpan = Math.min(newColSpan, maxColSpan);
    const finalRowSpan = Math.min(newRowSpan, maxRowSpan);
    
    if (isValidPosition(resizingItem, resizingItem.colStart, resizingItem.rowStart, finalColSpan, finalRowSpan)) {
        resizingItem.colSpan = finalColSpan;
        resizingItem.rowSpan = finalRowSpan;
        updateGrid();
    }
}

function handleResizeEnd() {
    if (resizingItem) {
        const element = document.querySelector(`[data-id="${resizingItem.id}"]`);
        if (element) {
            element.classList.remove('resizing');
        }
        resizingItem = null;
    }
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
}

function generateCode() {
    generateHTML();
    generateCSS();
}

function generateHTML() {
    let html = '<div class="grid-container">\n';
    
    gridItems.forEach(item => {
        html += `  <div class="grid-item item-${item.id}">項目 ${item.id}</div>\n`;
    });
    
    html += '</div>';
    
    htmlCode.innerHTML = highlightHTML(html);
}

function generateCSS() {
    const { columns, rows, columnGap, rowGap } = gridState;
    const css = generateRegularCSS(columns, rows, columnGap, rowGap);
    cssCode.innerHTML = highlightCSS(css);
}

function generateRegularCSS(columns, rows, columnGap, rowGap) {
    const gapProperty = (columnGap === rowGap) 
        ? `  gap: ${rowGap}px;`
        : `  column-gap: ${columnGap}px;\n  row-gap: ${rowGap}px;`;
    
    let css = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
${gapProperty}
  padding: 20px;
  min-height: 400px;
}

.grid-item {
  background: #e0e7ff;
  border: 2px solid #6366f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #6366f1;
}

`;
    
    gridItems.forEach(item => {
        css += `.grid-item.item-${item.id} {
  grid-column: ${item.colStart} / ${item.colEnd};
  grid-row: ${item.rowStart} / ${item.rowEnd};
}

`;
    });
    
    return css;
}

function highlightHTML(html) {
    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="property">$2</span>')
        .replace(/(class)=/g, '<span class="property">$1</span>=')
        .replace(/="([^"]+)"/g, '="<span class="value">$1</span>"');
}

function highlightCSS(css) {
    return css
        .replace(/([a-z-]+)(?=:)/g, '<span class="property">$1</span>')
        .replace(/:\s*([^;]+)/g, ': <span class="value">$1</span>');
}

function copyToClipboard(type) {
    const codeElement = type === 'html' ? htmlCode : cssCode;
    const button = type === 'html' ? copyHtmlBtn : copyCssBtn;
    const buttonText = button.querySelector('.copy-text');
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = buttonText.textContent;
        buttonText.textContent = '已複製！';
        button.classList.add('copied');
        
        setTimeout(() => {
            buttonText.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('複製失敗:', err);
        fallbackCopyToClipboard(code, button, buttonText);
    });
}

function fallbackCopyToClipboard(text, button, buttonText) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        const originalText = buttonText.textContent;
        buttonText.textContent = '已複製！';
        button.classList.add('copied');
        
        setTimeout(() => {
            buttonText.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('降級複製也失敗:', err);
        showNotification('複製失敗，請手動複製代碼', 'error');
    }
    
    document.body.removeChild(textArea);
}

function exportConfiguration() {
    const config = {
        version: '1.0',
        gridState: gridState,
        gridItems: gridItems.map(item => ({
            id: item.id,
            colStart: item.colStart,
            rowStart: item.rowStart,
            colSpan: item.colSpan,
            rowSpan: item.rowSpan
        })),
        itemIdCounter: itemIdCounter,
        timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `grid-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('配置已成功匯出', 'success');
}

function importConfiguration(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            
            if (!config.gridState || !config.gridItems) {
                throw new Error('無效的配置文件格式');
            }
            
            gridState = { ...config.gridState };
            
            columnsSlider.value = gridState.columns;
            columnsValue.value = gridState.columns;
            rowsSlider.value = gridState.rows;
            rowsValue.value = gridState.rows;
            columnGapSlider.value = gridState.columnGap;
            columnGapValue.value = gridState.columnGap;
            rowGapSlider.value = gridState.rowGap;
            rowGapValue.value = gridState.rowGap;
            
            gridItems = [];
            config.gridItems.forEach(itemData => {
                const item = new GridItem(
                    itemData.id,
                    itemData.colStart,
                    itemData.rowStart,
                    itemData.colSpan,
                    itemData.rowSpan
                );
                gridItems.push(item);
            });
            
            if (config.itemIdCounter) {
                itemIdCounter = config.itemIdCounter;
            }
            
            updateGrid();
            
            showNotification('配置已成功匯入！', 'success');
        } catch (error) {
            console.error('匯入配置失敗:', error);
            showNotification('匯入配置失敗：' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    
    e.target.value = '';
}

function selectItem(item) {
    selectedItem = item;
    
    document.querySelectorAll('.grid-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    const element = document.querySelector(`[data-id="${item.id}"]`);
    if (element) {
        element.classList.add('selected');
    }
    
    showPropertiesPanel(item);
}

function showPropertiesPanel(item) {
    selectedItemIdSpan.textContent = `#${item.id}`;
    propColStart.value = item.colStart;
    propColEnd.value = item.colEnd;
    propRowStart.value = item.rowStart;
    propRowEnd.value = item.rowEnd;
    
    propColStart.max = gridState.columns;
    propColEnd.max = gridState.columns + 1;
    propRowStart.max = gridState.rows;
    propRowEnd.max = gridState.rows + 1;
    
    itemPropertiesPanel.style.display = 'block';
}

function closePropertiesPanel() {
    itemPropertiesPanel.style.display = 'none';
    selectedItem = null;
    
    document.querySelectorAll('.grid-item').forEach(el => {
        el.classList.remove('selected');
    });
}

function applyPropertyChanges() {
    if (!selectedItem) return;
    
    const colStart = parseInt(propColStart.value);
    const colEnd = parseInt(propColEnd.value);
    const rowStart = parseInt(propRowStart.value);
    const rowEnd = parseInt(propRowEnd.value);
    
    if (colStart < 1 || colStart > gridState.columns) {
        showNotification('列起始值無效', 'error');
        return;
    }
    
    if (colEnd <= colStart || colEnd > gridState.columns + 1) {
        showNotification('列結束值無效', 'error');
        return;
    }
    
    if (rowStart < 1 || rowStart > gridState.rows) {
        showNotification('行起始值無效', 'error');
        return;
    }
    
    if (rowEnd <= rowStart || rowEnd > gridState.rows + 1) {
        showNotification('行結束值無效', 'error');
        return;
    }
    
    const newColSpan = colEnd - colStart;
    const newRowSpan = rowEnd - rowStart;
    
    if (isValidPosition(selectedItem, colStart, rowStart, newColSpan, newRowSpan)) {
        selectedItem.colStart = colStart;
        selectedItem.rowStart = rowStart;
        selectedItem.colSpan = newColSpan;
        selectedItem.rowSpan = newRowSpan;
        
        updateGrid();
        
        selectItem(selectedItem);
        showNotification('項目屬性已更新', 'success');
    } else {
        showNotification('該位置會與其他項目重疊，請選擇其他位置', 'warning');
    }
}

const notificationContainer = document.getElementById('notification-container');

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    
    const titles = {
        success: '成功',
        error: '錯誤',
        warning: '警告',
        info: '資訊'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type]}</div>
        <div class="notification-content">
            <div class="notification-title">${titles[type]}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'notificationSlideIn 200ms ease reverse';
        setTimeout(() => notification.remove(), 200);
    });
    
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'notificationSlideIn 200ms ease reverse';
                setTimeout(() => notification.remove(), 200);
            }
        }, duration);
    }
}

const confirmDialog = document.getElementById('confirm-dialog');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmOkBtn = document.getElementById('confirm-ok-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

function showConfirmDialog(message, title = '確認') {
    return new Promise((resolve) => {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmDialog.style.display = 'flex';
        
        const handleOk = () => {
            confirmDialog.style.display = 'none';
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            confirmDialog.style.display = 'none';
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            confirmOkBtn.removeEventListener('click', handleOk);
            confirmCancelBtn.removeEventListener('click', handleCancel);
        };
        
        confirmOkBtn.addEventListener('click', handleOk);
        confirmCancelBtn.addEventListener('click', handleCancel);
    });
}

function showLoadingOverlay(message = '載入中...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function hideLoadingOverlay(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

function addGridItemWithAnimation(colStart, colEnd, rowStart, rowEnd) {
    const loadingOverlay = showLoadingOverlay('添加項目中...');
    
    setTimeout(() => {
        addGridItem(colStart, colEnd, rowStart, rowEnd);
        hideLoadingOverlay(loadingOverlay);
    }, 300);
}

function removeGridItemWithAnimation(itemId) {
    const item = gridItems.find(item => item.id === itemId);
    if (!item) return;
    
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
        element.classList.add('item-exit');
        setTimeout(() => {
            removeGridItem(itemId);
        }, 300);
    } else {
        removeGridItem(itemId);
    }
}

function showAboutDialog() {
    aboutDialog.style.display = 'flex';
}

function closeAboutDialog() {
    aboutDialog.style.display = 'none';
}

init();