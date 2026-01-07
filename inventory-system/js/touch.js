// Touch Control System
class TouchManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.isDragging = false;
        this.dragPart = null;
        this.lastTouch = null;
    }

    init() {
        const canvas = this.gridManager.canvas;

        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.lastTouch = { x: touch.clientX, y: touch.clientY };
        const gridPos = this.gridManager.canvasToGrid(touch.clientX, touch.clientY);
        if (gridPos) {
            this.gridManager.hoveredSlot = gridPos;
            this.gridManager.render();
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const gridPos = this.gridManager.canvasToGrid(touch.clientX, touch.clientY);
        if (gridPos) {
            this.gridManager.hoveredSlot = gridPos;
            this.gridManager.render();
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (this.gridManager.hoveredSlot && this.gridManager.selectedPart) {
            this.gridManager.placePart(
                this.gridManager.selectedPart,
                this.gridManager.hoveredSlot.x,
                this.gridManager.hoveredSlot.y
            );
        }
        this.gridManager.hoveredSlot = null;
        this.gridManager.render();
    }

    handleMouseDown(e) {
        const gridPos = this.gridManager.canvasToGrid(e.clientX, e.clientY);
        if (gridPos) {
            this.gridManager.hoveredSlot = gridPos;
            this.gridManager.render();
        }
    }

    handleMouseMove(e) {
        const gridPos = this.gridManager.canvasToGrid(e.clientX, e.clientY);
        if (gridPos) {
            this.gridManager.hoveredSlot = gridPos;
            this.gridManager.render();
        }
    }

    handleMouseUp(e) {
        if (this.gridManager.hoveredSlot && this.gridManager.selectedPart) {
            this.gridManager.placePart(
                this.gridManager.selectedPart,
                this.gridManager.hoveredSlot.x,
                this.gridManager.hoveredSlot.y
            );
        }
        this.gridManager.hoveredSlot = null;
        this.gridManager.render();
    }
}
