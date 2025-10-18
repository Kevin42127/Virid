// ===========================
// DOM 元素
// ===========================
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

// ===========================
// 狀態管理
// ===========================
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

// ===========================
// 初始化
// ===========================
function init() {
    // 綁定事件監聽器
    bindEventListeners();
    
    // 創建初始網格項目
    addGridItem(1, 1, 1, 1);
    addGridItem(2, 1, 1, 1);
    addGridItem(1, 2, 1, 1);
    
    // 初始化滑桿填充
    initSliders();
    
    // 初始化網格
    updateGrid();
}

// ===========================
// 初始化滑桿填充
// ===========================
function initSliders() {
    updateSliderFill(columnsSlider);
    updateSliderFill(rowsSlider);
    updateSliderFill(columnGapSlider);
    updateSliderFill(rowGapSlider);
}

// ===========================
// 更新滑桿填充百分比
// ===========================
function updateSliderFill(slider) {
    const value = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-value', `${percentage}%`);
}

// ===========================
// 網格項目類別
// ===========================
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

// ===========================
// 添加網格項目
// ===========================
function addGridItem(colStart, rowStart, colSpan = 1, rowSpan = 1) {
    const item = new GridItem(itemIdCounter++, colStart, rowStart, colSpan, rowSpan);
    gridItems.push(item);
    return item;
}

// ===========================
// 刪除網格項目
// ===========================
function removeGridItem(id) {
    gridItems = gridItems.filter(item => item.id !== id);
    updateGrid();
}

// ===========================
// 尋找空位置
// ===========================
function findEmptyPosition() {
    const { columns, rows } = gridState;
    
    // 檢查每個格子是否被佔用
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
            // 創建一個臨時項目來檢查這個位置
            const tempItem = {
                id: -1,
                colStart: col,
                rowStart: row,
                colSpan: 1,
                rowSpan: 1,
                get colEnd() { return this.colStart + this.colSpan; },
                get rowEnd() { return this.rowStart + this.rowSpan; }
            };
            
            // 檢查是否與任何現有項目重疊
            const hasOverlap = gridItems.some(item => checkOverlap(tempItem, item));
            
            if (!hasOverlap) {
                return { col, row };
            }
        }
    }
    
    // 如果沒有空位，返回第一個位置（可能會重疊，但至少有個位置）
    return { col: 1, row: 1 };
}

// ===========================
// 事件監聽器綁定
// ===========================
function bindEventListeners() {
    // 列數控制
    columnsSlider.addEventListener('input', (e) => {
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
    
    // 行數控制
    rowsSlider.addEventListener('input', (e) => {
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
    
    // 列間距控制
    columnGapSlider.addEventListener('input', (e) => {
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
    
    // 行間距控制
    rowGapSlider.addEventListener('input', (e) => {
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
    
    // 添加項目按鈕
    addItemBtn.addEventListener('click', () => {
        const pos = findEmptyPosition();
        addGridItem(pos.col, pos.row, 1, 1);
        updateGrid();
    });
    
    // 複製按鈕
    copyHtmlBtn.addEventListener('click', () => copyToClipboard('html'));
    copyCssBtn.addEventListener('click', () => copyToClipboard('css'));
    
    // 重置按鈕
    resetBtn.addEventListener('click', resetAll);
    
    // 清空按鈕
    clearBtn.addEventListener('click', clearAllItems);
    
    // 網格線開關
    showGridLinesCheckbox.addEventListener('change', (e) => {
        showGridLines = e.target.checked;
        toggleGridLines();
    });
    
    // 模板按鈕
    templateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;
            applyTemplate(template);
        });
    });
    
    // 匯出按鈕
    exportBtn.addEventListener('click', exportConfiguration);
    
    // 匯入按鈕
    importBtn.addEventListener('click', () => {
        importFileInput.click();
    });
    
    importFileInput.addEventListener('change', importConfiguration);
    
    // 關閉屬性面板
    closePanelBtn.addEventListener('click', closePropertiesPanel);
    
    // 套用屬性變更
    applyPropertiesBtn.addEventListener('click', applyPropertyChanges);
    
    // 幫助按鈕
    helpButton.addEventListener('click', showAboutDialog);
    closeAboutBtn.addEventListener('click', closeAboutDialog);
    
    // 點擊遮罩關閉
    aboutDialog.querySelector('.about-dialog-overlay').addEventListener('click', closeAboutDialog);
}

// ===========================
// 重置所有設定
// ===========================
function resetAll() {
    // 重置網格狀態
    gridState = { ...DEFAULT_STATE };
    
    // 更新控制項
    columnsSlider.value = DEFAULT_STATE.columns;
    columnsValue.value = DEFAULT_STATE.columns;
    rowsSlider.value = DEFAULT_STATE.rows;
    rowsValue.value = DEFAULT_STATE.rows;
    columnGapSlider.value = DEFAULT_STATE.columnGap;
    columnGapValue.value = DEFAULT_STATE.columnGap;
    rowGapSlider.value = DEFAULT_STATE.rowGap;
    rowGapValue.value = DEFAULT_STATE.rowGap;
    
    // 清空項目
    gridItems = [];
    itemIdCounter = 1;
    
    // 添加預設項目
    addGridItem(1, 1, 1, 1);
    addGridItem(2, 1, 1, 1);
    addGridItem(1, 2, 1, 1);
    
    // 更新網格
    updateGrid();
}

// ===========================
// 清空所有項目
// ===========================
async function clearAllItems() {
    if (gridItems.length === 0) return;
    
    const confirmed = await showConfirmDialog('確定要清空所有網格項目嗎？', '清空項目');
    if (confirmed) {
        gridItems = [];
        updateGrid();
        showNotification('所有項目已清空', 'success');
    }
}

// ===========================
// 切換網格線顯示
// ===========================
function toggleGridLines() {
    if (showGridLines) {
        gridPreview.classList.add('show-grid-lines');
    } else {
        gridPreview.classList.remove('show-grid-lines');
    }
}

// ===========================
// 套用模板
// ===========================
function applyTemplate(templateName) {
    // 清空現有項目
    gridItems = [];
    itemIdCounter = 1;
    
    switch (templateName) {
        case 'basic':
            // 基本 3x3 佈局
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
            // 頭部-內容-底部
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 5, 2); // Header (跨5列，2行)
            addGridItem(1, 3, 5, 3); // Content (跨5列，3行)
            addGridItem(1, 6, 5, 1); // Footer (跨5列，1行)
            break;
            
        case 'sidebar':
            // 頭部-側邊欄-內容
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 5, 1); // Header
            addGridItem(1, 2, 1, 5); // Left Sidebar (跨1列，5行)
            addGridItem(2, 2, 4, 5); // Content (跨4列，5行)
            break;
            
        case 'holy-grail':
            // 聖杯佈局：頭部-左側-主內容-右側-底部
            gridState.columns = 5;
            gridState.rows = 6;
            addGridItem(1, 1, 5, 1); // Header
            addGridItem(1, 2, 1, 4); // Left Sidebar (跨1列，4行)
            addGridItem(2, 2, 3, 4); // Main Content (跨3列，4行)
            addGridItem(5, 2, 1, 4); // Right Sidebar (跨1列，4行)
            addGridItem(1, 6, 5, 1); // Footer
            break;
    }
    
    // 更新控制項
    columnsSlider.value = gridState.columns;
    columnsValue.value = gridState.columns;
    rowsSlider.value = gridState.rows;
    rowsValue.value = gridState.rows;
    
    // 更新網格
    updateGrid();
}

// ===========================
// 更新網格
// ===========================
function updateGrid(skipAnimation = true) {
    const { columns, rows, columnGap, rowGap } = gridState;
    
    // 調整所有項目以適應新的網格大小
    adjustItemsToGrid();
    
    // 更新預覽區域的網格樣式
    gridPreview.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gridPreview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridPreview.style.columnGap = `${columnGap}px`;
    gridPreview.style.rowGap = `${rowGap}px`;
    
    // 更新CSS變數（用於網格線）
    gridPreview.style.setProperty('--grid-columns', columns);
    gridPreview.style.setProperty('--grid-rows', rows);
    
    // 更新網格線
    toggleGridLines();
    
    // 渲染網格項目（拖動時跳過動畫）
    renderGridItems(skipAnimation);
    
    // 更新代碼
    generateCode();
}

// ===========================
// 調整項目以適應網格大小
// ===========================
function adjustItemsToGrid() {
    const { columns, rows } = gridState;
    
    gridItems.forEach(item => {
        // 調整列位置和大小
        if (item.colStart > columns) {
            item.colStart = columns;
        }
        if (item.colEnd > columns + 1) {
            item.colSpan = columns - item.colStart + 1;
        }
        
        // 調整行位置和大小
        if (item.rowStart > rows) {
            item.rowStart = rows;
        }
        if (item.rowEnd > rows + 1) {
            item.rowSpan = rows - item.rowStart + 1;
        }
        
        // 確保最小大小為 1
        if (item.colSpan < 1) item.colSpan = 1;
        if (item.rowSpan < 1) item.rowSpan = 1;
    });
    
    // 解決可能的重疊問題
    resolveOverlaps();
}

// ===========================
// 解決重疊問題
// ===========================
function resolveOverlaps() {
    const { columns, rows } = gridState;
    
    // 多次迭代以解決所有重疊
    let maxIterations = 20;
    let hasOverlap = true;
    
    while (hasOverlap && maxIterations > 0) {
        hasOverlap = false;
        
        for (let i = 0; i < gridItems.length; i++) {
            for (let j = i + 1; j < gridItems.length; j++) {
                if (checkOverlap(gridItems[i], gridItems[j])) {
                    hasOverlap = true;
                    
                    // 嘗試移動第二個項目到空位
                    const emptyPos = findEmptyPositionForItem(gridItems[j]);
                    if (emptyPos) {
                        gridItems[j].colStart = emptyPos.col;
                        gridItems[j].rowStart = emptyPos.row;
                        
                        // 確保新位置不超出邊界
                        if (gridItems[j].colEnd > columns + 1) {
                            gridItems[j].colSpan = columns - gridItems[j].colStart + 1;
                        }
                        if (gridItems[j].rowEnd > rows + 1) {
                            gridItems[j].rowSpan = rows - gridItems[j].rowStart + 1;
                        }
                    } else {
                        // 如果找不到空位，縮小項目大小
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

// ===========================
// 為特定項目尋找空位置
// ===========================
function findEmptyPositionForItem(item) {
    const { columns, rows } = gridState;
    
    // 檢查每個可能的位置
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
            // 檢查這個位置是否適合該項目
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
                
                // 檢查是否與其他項目重疊
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

// ===========================
// 渲染網格項目
// ===========================
function renderGridItems(skipAnimation = false) {
    // 清空現有項目
    gridPreview.innerHTML = '';
    
    // 為網格容器添加拖放事件（允許拖到空格）
    gridPreview.addEventListener('dragover', handleDragOver);
    gridPreview.addEventListener('drop', handleDrop);
    
    // 創建每個項目
    gridItems.forEach((item, index) => {
        const element = createGridItemElement(item);
        gridPreview.appendChild(element);
        
        // 只在初始化或添加新項目時添加進入動畫
        if (!skipAnimation) {
            setTimeout(() => {
                element.classList.add('item-enter');
            }, index * 50); // 錯開動畫時間
        }
    });
}

// ===========================
// 創建網格項目元素
// ===========================
function createGridItemElement(item) {
    const element = document.createElement('div');
    element.className = 'grid-item';
    element.dataset.id = item.id;
    element.textContent = item.id;
    element.draggable = true;
    
    // 設置網格位置
    element.style.gridColumnStart = item.colStart;
    element.style.gridColumnEnd = item.colEnd;
    element.style.gridRowStart = item.rowStart;
    element.style.gridRowEnd = item.rowEnd;
    
    // 創建刪除按鈕
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeGridItem(item.id);
    });
    element.appendChild(deleteBtn);
    
    // 創建調整大小手柄
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    element.appendChild(resizeHandle);
    
    // 拖動事件
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    
    // 調整大小事件
    resizeHandle.addEventListener('mousedown', (e) => handleResizeStart(e, item));
    
    // 點擊選中項目
    element.addEventListener('click', (e) => {
        // 不要在拖動或調整大小時選中
        if (!draggedItem && !resizingItem) {
            selectItem(item);
        }
    });
    
    return element;
}

// ===========================
// 拖動事件處理
// ===========================
function handleDragStart(e) {
    const id = parseInt(e.target.dataset.id);
    draggedItem = gridItems.find(item => item.id === id);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // 儲存拖動開始時的偏移量
    const rect = e.target.getBoundingClientRect();
    e.dataTransfer.setData('offsetX', e.clientX - rect.left);
    e.dataTransfer.setData('offsetY', e.clientY - rect.top);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedItem = null;
    
    // 移除占位符
    if (placeholderElement) {
        placeholderElement.remove();
        placeholderElement = null;
    }
    
    // 移除所有拖動提示
    document.querySelectorAll('.grid-item.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // 計算當前滑鼠位置對應的網格座標
    if (draggedItem) {
        const gridRect = gridPreview.getBoundingClientRect();
        const x = e.clientX - gridRect.left;
        const y = e.clientY - gridRect.top;
        
        // 計算網格單元格大小
        const cellWidth = gridRect.width / gridState.columns;
        const cellHeight = gridRect.height / gridState.rows;
        
        // 計算目標網格位置
        const col = Math.floor(x / cellWidth) + 1;
        const row = Math.floor(y / cellHeight) + 1;
        
        // 限制在網格範圍內
        const targetCol = Math.max(1, Math.min(col, gridState.columns));
        const targetRow = Math.max(1, Math.min(row, gridState.rows));
        
        // 高亮顯示目標位置
        highlightDropTarget(targetCol, targetRow);
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    // 移除占位符
    if (placeholderElement) {
        placeholderElement.remove();
        placeholderElement = null;
    }
    
    // 計算放下位置的網格座標
    const gridRect = gridPreview.getBoundingClientRect();
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;
    
    // 計算網格單元格大小
    const cellWidth = gridRect.width / gridState.columns;
    const cellHeight = gridRect.height / gridState.rows;
    
    // 計算目標網格位置
    const col = Math.floor(x / cellWidth) + 1;
    const row = Math.floor(y / cellHeight) + 1;
    
    // 限制在網格範圍內
    const targetCol = Math.max(1, Math.min(col, gridState.columns));
    const targetRow = Math.max(1, Math.min(row, gridState.rows));
    
    // 檢查是否放在其他項目上（排除占位符）
    const targetElement = e.target.closest('.grid-item:not(.drag-placeholder)');
    if (targetElement && targetElement.dataset.id) {
        const targetId = parseInt(targetElement.dataset.id);
        const targetItem = gridItems.find(item => item.id === targetId);
        
        // 如果放在其他項目上，交換位置
        if (targetItem && targetItem.id !== draggedItem.id) {
            swapItems(draggedItem, targetItem);
            updateGrid();
            return;
        }
    }
    
    // 否則，移動到計算出的網格位置
    moveItemToPosition(draggedItem, targetCol, targetRow);
    updateGrid();
}

// ===========================
// 交換兩個項目
// ===========================
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

// ===========================
// 移動項目到指定位置
// ===========================
function moveItemToPosition(item, targetCol, targetRow) {
    // 確保不超出網格邊界
    const maxCol = gridState.columns - item.colSpan + 1;
    const maxRow = gridState.rows - item.rowSpan + 1;
    
    const newCol = Math.max(1, Math.min(targetCol, maxCol));
    const newRow = Math.max(1, Math.min(targetRow, maxRow));
    
    // 檢查新位置是否有效（不重疊）
    if (isValidPosition(item, newCol, newRow, item.colSpan, item.rowSpan)) {
        item.colStart = newCol;
        item.rowStart = newRow;
    } else {
        // 如果目標位置有重疊，尋找最近的有效位置
        const nearestPos = findNearestValidPosition(item, newCol, newRow);
        if (nearestPos) {
            item.colStart = nearestPos.col;
            item.rowStart = nearestPos.row;
        }
        // 如果找不到有效位置，保持原位
    }
}

// ===========================
// 尋找最近的有效位置
// ===========================
function findNearestValidPosition(item, targetCol, targetRow) {
    const { columns, rows } = gridState;
    let minDistance = Infinity;
    let bestPosition = null;
    
    // 搜索範圍：以目標位置為中心的區域
    for (let row = 1; row <= rows - item.rowSpan + 1; row++) {
        for (let col = 1; col <= columns - item.colSpan + 1; col++) {
            if (isValidPosition(item, col, row, item.colSpan, item.rowSpan)) {
                // 計算距離
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

// ===========================
// 高亮顯示放置目標
// ===========================
let placeholderElement = null;

function highlightDropTarget(col, row) {
    if (!draggedItem) return;
    
    // 移除舊的占位符
    if (placeholderElement) {
        placeholderElement.remove();
        placeholderElement = null;
    }
    
    // 檢查目標位置是否有效
    const maxCol = gridState.columns - draggedItem.colSpan + 1;
    const maxRow = gridState.rows - draggedItem.rowSpan + 1;
    
    const targetCol = Math.max(1, Math.min(col, maxCol));
    const targetRow = Math.max(1, Math.min(row, maxRow));
    
    // 檢查是否會重疊
    if (!isValidPosition(draggedItem, targetCol, targetRow, draggedItem.colSpan, draggedItem.rowSpan)) {
        return; // 無效位置，不顯示占位符
    }
    
    // 創建占位符
    placeholderElement = document.createElement('div');
    placeholderElement.className = 'grid-item drag-placeholder';
    placeholderElement.style.gridColumnStart = targetCol;
    placeholderElement.style.gridColumnEnd = targetCol + draggedItem.colSpan;
    placeholderElement.style.gridRowStart = targetRow;
    placeholderElement.style.gridRowEnd = targetRow + draggedItem.rowSpan;
    placeholderElement.style.pointerEvents = 'none';
    
    gridPreview.appendChild(placeholderElement);
}

// ===========================
// 檢查項目是否重疊
// ===========================
function checkOverlap(item1, item2) {
    return !(item1.colEnd <= item2.colStart || 
             item1.colStart >= item2.colEnd ||
             item1.rowEnd <= item2.rowStart || 
             item1.rowStart >= item2.rowEnd);
}

// ===========================
// 檢查位置是否有效（不重疊且不超出邊界）
// ===========================
function isValidPosition(item, newColStart, newRowStart, newColSpan, newRowSpan) {
    // 檢查是否超出網格邊界
    if (newColStart < 1 || newRowStart < 1) return false;
    if (newColStart + newColSpan - 1 > gridState.columns) return false;
    if (newRowStart + newRowSpan - 1 > gridState.rows) return false;
    
    // 創建臨時項目來檢查重疊
    const tempItem = {
        colStart: newColStart,
        rowStart: newRowStart,
        colSpan: newColSpan,
        rowSpan: newRowSpan,
        get colEnd() { return this.colStart + this.colSpan; },
        get rowEnd() { return this.rowStart + this.rowSpan; }
    };
    
    // 檢查與其他項目是否重疊
    for (let other of gridItems) {
        if (other.id !== item.id && checkOverlap(tempItem, other)) {
            return false;
        }
    }
    
    return true;
}

// ===========================
// 調整大小事件處理
// ===========================
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
    
    // 估算列和行的大小變化
    const colChange = Math.round(deltaX / 100); // 粗略估計
    const rowChange = Math.round(deltaY / 80);
    
    const newColSpan = Math.max(1, resizeStartColSpan + colChange);
    const newRowSpan = Math.max(1, resizeStartRowSpan + rowChange);
    
    // 確保不超出網格邊界
    const maxColSpan = gridState.columns - resizingItem.colStart + 1;
    const maxRowSpan = gridState.rows - resizingItem.rowStart + 1;
    
    const finalColSpan = Math.min(newColSpan, maxColSpan);
    const finalRowSpan = Math.min(newRowSpan, maxRowSpan);
    
    // 檢查新大小是否會造成重疊
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

// ===========================
// 生成代碼
// ===========================
function generateCode() {
    generateHTML();
    generateCSS();
}

// ===========================
// 生成 HTML 代碼
// ===========================
function generateHTML() {
    let html = '<div class="grid-container">\n';
    
    gridItems.forEach(item => {
        html += `  <div class="grid-item item-${item.id}">項目 ${item.id}</div>\n`;
    });
    
    html += '</div>';
    
    htmlCode.innerHTML = highlightHTML(html);
}

// ===========================
// 生成 CSS 代碼
// ===========================
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

// ===========================
// HTML 語法高亮
// ===========================
function highlightHTML(html) {
    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="property">$2</span>')
        .replace(/(class)=/g, '<span class="property">$1</span>=')
        .replace(/="([^"]+)"/g, '="<span class="value">$1</span>"');
}

// ===========================
// CSS 語法高亮
// ===========================
function highlightCSS(css) {
    return css
        .replace(/([a-z-]+)(?=:)/g, '<span class="property">$1</span>')
        .replace(/:\s*([^;]+)/g, ': <span class="value">$1</span>');
}

// ===========================
// 複製到剪貼簿
// ===========================
function copyToClipboard(type) {
    const codeElement = type === 'html' ? htmlCode : cssCode;
    const button = type === 'html' ? copyHtmlBtn : copyCssBtn;
    const buttonText = button.querySelector('.copy-text');
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        // 顯示成功反饋
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

// ===========================
// 降級複製方案
// ===========================
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

// ===========================
// 匯出配置
// ===========================
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

// ===========================
// 匯入配置
// ===========================
function importConfiguration(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            
            // 驗證配置格式
            if (!config.gridState || !config.gridItems) {
                throw new Error('無效的配置文件格式');
            }
            
            // 載入網格狀態
            gridState = { ...config.gridState };
            
            // 更新控制項
            columnsSlider.value = gridState.columns;
            columnsValue.value = gridState.columns;
            rowsSlider.value = gridState.rows;
            rowsValue.value = gridState.rows;
            columnGapSlider.value = gridState.columnGap;
            columnGapValue.value = gridState.columnGap;
            rowGapSlider.value = gridState.rowGap;
            rowGapValue.value = gridState.rowGap;
            
            // 載入網格項目
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
            
            // 更新計數器
            if (config.itemIdCounter) {
                itemIdCounter = config.itemIdCounter;
            }
            
            // 更新網格
            updateGrid();
            
            showNotification('配置已成功匯入！', 'success');
        } catch (error) {
            console.error('匯入配置失敗:', error);
            showNotification('匯入配置失敗：' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // 清空 input，允許再次選擇同一個文件
    e.target.value = '';
}

// ===========================
// 選中項目
// ===========================
function selectItem(item) {
    selectedItem = item;
    
    // 移除所有項目的選中狀態
    document.querySelectorAll('.grid-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 添加選中狀態
    const element = document.querySelector(`[data-id="${item.id}"]`);
    if (element) {
        element.classList.add('selected');
    }
    
    // 顯示屬性面板
    showPropertiesPanel(item);
}

// ===========================
// 顯示屬性面板
// ===========================
function showPropertiesPanel(item) {
    selectedItemIdSpan.textContent = `#${item.id}`;
    propColStart.value = item.colStart;
    propColEnd.value = item.colEnd;
    propRowStart.value = item.rowStart;
    propRowEnd.value = item.rowEnd;
    
    // 設定輸入框的最大值
    propColStart.max = gridState.columns;
    propColEnd.max = gridState.columns + 1;
    propRowStart.max = gridState.rows;
    propRowEnd.max = gridState.rows + 1;
    
    itemPropertiesPanel.style.display = 'block';
}

// ===========================
// 關閉屬性面板
// ===========================
function closePropertiesPanel() {
    itemPropertiesPanel.style.display = 'none';
    selectedItem = null;
    
    // 移除所有選中狀態
    document.querySelectorAll('.grid-item').forEach(el => {
        el.classList.remove('selected');
    });
}

// ===========================
// 套用屬性變更
// ===========================
function applyPropertyChanges() {
    if (!selectedItem) return;
    
    const colStart = parseInt(propColStart.value);
    const colEnd = parseInt(propColEnd.value);
    const rowStart = parseInt(propRowStart.value);
    const rowEnd = parseInt(propRowEnd.value);
    
    // 驗證輸入
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
    
    // 計算新的大小
    const newColSpan = colEnd - colStart;
    const newRowSpan = rowEnd - rowStart;
    
    // 檢查新位置是否有效（不與其他項目重疊）
    if (isValidPosition(selectedItem, colStart, rowStart, newColSpan, newRowSpan)) {
        selectedItem.colStart = colStart;
        selectedItem.rowStart = rowStart;
        selectedItem.colSpan = newColSpan;
        selectedItem.rowSpan = newRowSpan;
        
        updateGrid();
        
        // 重新選中項目以更新屬性面板
        selectItem(selectedItem);
        showNotification('項目屬性已更新', 'success');
    } else {
        showNotification('該位置會與其他項目重疊，請選擇其他位置', 'warning');
    }
}

// ===========================
// 通知系統
// ===========================
const notificationContainer = document.getElementById('notification-container');

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // 圖標
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
    
    // 關閉按鈕
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'notificationSlideIn 200ms ease reverse';
        setTimeout(() => notification.remove(), 200);
    });
    
    // 自動移除
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'notificationSlideIn 200ms ease reverse';
                setTimeout(() => notification.remove(), 200);
            }
        }, duration);
    }
}

// ===========================
// 確認對話框
// ===========================
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

// ===========================
// 顯示載入動畫
// ===========================
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

// ===========================
// 隱藏載入動畫
// ===========================
function hideLoadingOverlay(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

// ===========================
// 添加項目動畫
// ===========================
function addGridItemWithAnimation(colStart, colEnd, rowStart, rowEnd) {
    const loadingOverlay = showLoadingOverlay('添加項目中...');
    
    setTimeout(() => {
        addGridItem(colStart, colEnd, rowStart, rowEnd);
        hideLoadingOverlay(loadingOverlay);
    }, 300);
}

// ===========================
// 移除項目動畫
// ===========================
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

// ===========================
// 顯示關於對話框
// ===========================
function showAboutDialog() {
    aboutDialog.style.display = 'flex';
}

// ===========================
// 關閉關於對話框
// ===========================
function closeAboutDialog() {
    aboutDialog.style.display = 'none';
}

// ===========================
// 啟動應用
// ===========================
init();
