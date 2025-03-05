class QuadTree {
    /**
     * Constraint:
     *      1. 'node' need have 'element'(DOM) and 'id' property
     *      2. left/top as same as html's, bottom=top+height, right=left+width.
     */
    static NOT_SUBTREE = null;
    static INF = Number.MAX_SAFE_INTEGER;
    static NEG_INF = Number.MIN_SAFE_INTEGER;
    static COLLAPSE_RATE = 0.25;
    static TREE_MIN_WIDTH = 30;
    static TREE_MIN_HEIGHT = 30;

    boundary;
    capacity;
    data = []; //{left, top, node}
    subtree = QuadTree.NOT_SUBTREE; // unordered
    dataBoundary = {
        topLeft: {
            left: QuadTree.INF,
            top: QuadTree.INF,
        },
        bottomRight: {
            left: QuadTree.NEG_INF,
            top: QuadTree.NEG_INF,
        },
    };
    #nodeId2Locations; // only in super tree, Map, node.id->{left,top}
    #collapseCapacity;

    static intersects(rectA, rectB) {
        const { left: aL, top: aT, width: aW, height: aH } = rectA;
        const { left: bL, top: bT, width: bW, height: bH } = rectB;

        if (aW <= 0 || aH <= 0 || bW <= 0 || bH <= 0) return false;

        const aR = aL + aW;
        const aB = aT + aH;
        const bR = bL + bW;
        const bB = bT + bH;

        // aL<aR bL<bR
        // aT<aB bT<bB

        return !(aL >= bR || aR <= bL || aT >= bB || aB <= bT);
    }

    static contains(rect, point) {
        const { left: L, top: T, width: W, height: H } = rect;
        const { left, top } = point;

        const R = L + W;
        const B = T + H;

        return L <= left && left < R && T <= top && top < B;
    }

    constructor(boundary, isSuper = false, capacity = 8) {
        /**
         * boundary: {left, top, width, height}
         */
        this.boundary = boundary;
        this.capacity = capacity;

        this.#collapseCapacity = Math.floor(capacity * QuadTree.COLLAPSE_RATE);

        if (isSuper) {
            this.#nodeId2Locations = new Map();
        }
    }

    onMiddleLine(left, top, width, height) {
        const { left: L, top: T, width: W, height: H } = this.boundary;

        const ML = L + W / 2;
        const MT = T + H / 2;
        const right = left + width;
        const bottom = top + height;

        return (left <= ML && ML < right) || (top <= MT && MT < bottom);
    }

    canDivide() {
        return (
            this.boundary.width > QuadTree.TREE_MIN_WIDTH &&
            this.boundary.height > QuadTree.TREE_MIN_HEIGHT
        );
    }

    updateDataBoundary(left, top, width, height) {
        if (
            left == undefined ||
            top == undefined ||
            width == undefined ||
            height == undefined
        ) {
            return;
        }
        this.dataBoundary.topLeft.left = Math.min(
            this.dataBoundary.topLeft.left,
            left
        );
        this.dataBoundary.topLeft.top = Math.min(
            this.dataBoundary.topLeft.top,
            top
        );
        this.dataBoundary.bottomRight.left = Math.max(
            this.dataBoundary.bottomRight.left,
            left + width
        );
        this.dataBoundary.bottomRight.top = Math.max(
            this.dataBoundary.bottomRight.top,
            top + height
        );
    }

    maintainDataBoundary() {
        this.dataBoundary = {
            topLeft: {
                left: QuadTree.INF,
                top: QuadTree.INF,
            },
            bottomRight: {
                left: QuadTree.NEG_INF,
                top: QuadTree.NEG_INF,
            },
        };
        if (this.subtree !== QuadTree.NOT_SUBTREE) {
            for (const sub of this.subtree) {
                const { left, top, width, height } = sub.getExtremumBoundary();
                this.updateDataBoundary(left, top, width, height);
            }
        }
        for (const { left, top, node } of this.data) {
            this.updateDataBoundary(
                left,
                top,
                node.element.offsetWidth,
                node.element.offsetHeight
            );
        }
    }

    getExtremumBoundary() {
        if (
            this.dataBoundary.topLeft.left === QuadTree.INF ||
            this.dataBoundary.topLeft.top === QuadTree.INF ||
            this.dataBoundary.bottomRight.left === QuadTree.NEG_INF ||
            this.dataBoundary.bottomRight.top === QuadTree.NEG_INF
        ) {
            return {
                left: undefined,
                top: undefined,
                width: undefined,
                height: undefined,
            };
        }
        return {
            left: this.dataBoundary.topLeft.left,
            top: this.dataBoundary.topLeft.top,
            width:
                this.dataBoundary.bottomRight.left -
                this.dataBoundary.topLeft.left,
            height:
                this.dataBoundary.bottomRight.top -
                this.dataBoundary.topLeft.top,
        };
    }

    maintainSubTree() {
        if (this.subtree === QuadTree.NOT_SUBTREE) return;

        let dataCount = 0;
        for (const sub of this.subtree) {
            if (sub.subtree === QuadTree.NOT_SUBTREE) {
                dataCount += sub.data.length;
            } else {
                return;
            }
        }
        if (dataCount >= this.#collapseCapacity) {
            return;
        }

        for (const sub of this.subtree) {
            this.data.push(...sub.data);
        }
        this.subtree = QuadTree.NOT_SUBTREE;
        this.maintainDataBoundary();
    }

    contains(left, top) {
        return QuadTree.contains(this.boundary, { left: left, top: top });
    }

    intersects(left, top, width, height) {
        return QuadTree.intersects(this.boundary, {
            left: left,
            top: top,
            width: width,
            height: height,
        });
    }

    subdivide() {
        const { left, top, width, height } = this.boundary;
        const subWidth = width / 2;
        const subHeight = height / 2;

        this.subtree = [
            new QuadTree({
                left: left,
                top: top,
                width: subWidth,
                height: subHeight,
            }),
            new QuadTree({
                left: left + subWidth,
                top: top,
                width: subWidth,
                height: subHeight,
            }),
            new QuadTree({
                left: left,
                top: top + subHeight,
                width: subWidth,
                height: subHeight,
            }),
            new QuadTree({
                left: left + subWidth,
                top: top + subHeight,
                width: subWidth,
                height: subHeight,
            }),
        ];

        const prevData = this.data;
        this.data = [];
        for (const { left, top, node } of prevData) {
            if (
                this.onMiddleLine(
                    left,
                    top,
                    node.element.offsetWidth,
                    node.element.offsetHeight
                )
            ) {
                this.data.push({
                    left: left,
                    top: top,
                    node: node,
                });
                continue;
            }

            for (const sub of this.subtree) {
                if (sub.contains(left, top)) {
                    sub.#insert(left, top, node);
                    break;
                }
            }
        }
    }

    #insert(left, top, node) {
        if (!this.contains(left, top)) return false;

        const width = node.element.offsetWidth;
        const height = node.element.offsetHeight;

        if (
            this.onMiddleLine(left, top, width, height) ||
            (this.subtree === QuadTree.NOT_SUBTREE &&
                (this.data.length < this.capacity || !this.canDivide()))
        ) {
            this.data.push({
                left: left,
                top: top,
                node: node,
            });

            this.updateDataBoundary(left, top, width, height);

            return true;
        }

        if (this.subtree === QuadTree.NOT_SUBTREE) {
            this.subdivide();
        }

        const inserted = this.subtree.some((sub) =>
            sub.#insert(left, top, node)
        );
        if (inserted) {
            this.updateDataBoundary(left, top, width, height);
        }
        return inserted;
    }

    insert(left, top, node) {
        if (!this.#insert(left, top, node)) {
            console.error("[QuadTree] cannot insert node!", {
                left: left,
                top: top,
                node: node,
                tree: this,
            });
            return false;
        }
        this.#nodeId2Locations.set(node.id, { left: left, top: top });
        return true;
    }

    #remove(left, top, node) {
        if (!this.contains(left, top)) return false;

        let idx = -1;
        for (const [i, info] of this.data.entries()) {
            if (info.node === node) {
                idx = i;
                break;
            }
        }
        if (idx !== -1) {
            this.data.splice(idx, 1);
            this.maintainDataBoundary();
            return true;
        }

        if (this.subtree !== QuadTree.NOT_SUBTREE) {
            const deleted = this.subtree.some((sub) =>
                sub.#remove(left, top, node)
            );
            if (deleted) {
                this.maintainDataBoundary();
                this.maintainSubTree();
            }
            return deleted;
        }

        return false;
    }

    remove(node) {
        if (!this.#nodeId2Locations.has(node.id)) {
            console.error("[QuadTree] node not found, cannot remove!", node);
            return false;
        }
        const { left, top } = this.#nodeId2Locations.get(node.id);
        if (!this.#remove(left, top, node)) {
            console.error("[QuadTree] cannot remove node!", {
                left: left,
                top: top,
                node: node,
                tree: this,
            });
            return false;
        }
        this.#nodeId2Locations.delete(node.id);
        return true;
    }

    update(left, top, node) {
        if (!this.#nodeId2Locations.has(node.id)) {
            console.error("[QuadTree] node not found, cannot update!", node);
            return false;
        }
        return !(!this.remove(node) || !this.insert(left, top, node));
    }

    query(left, top, width, height, res = []) {
        if (!this.intersects(left, top, width, height)) return res;

        if (this.subtree !== QuadTree.NOT_SUBTREE) {
            this.subtree.forEach((sub) =>
                sub.query(left, top, width, height, res)
            );
        }

        for (const { left: L, top: T, node } of this.data) {
            if (
                QuadTree.intersects(
                    {
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                    },
                    {
                        left: L,
                        top: T,
                        width: node.element.offsetWidth,
                        height: node.element.offsetHeight,
                    }
                )
            ) {
                res.push(node);
            }
        }
        return res;
    }
}

class EdgeHighlighter {
    static BASE_CLASS_NAME = "edge-highlight";
    static BIT_TO_DIR = ["left", "right", "top", "bottom"];

    viewportEle;
    currentMask = 0;
    constructor(viewportEle) {
        this.viewportEle = viewportEle;

        this.#createEdgeElements();
    }

    #createEdgeElements() {
        this.edges = {
            top: document.createElement("div"),
            right: document.createElement("div"),
            bottom: document.createElement("div"),
            left: document.createElement("div"),
        };

        Object.entries(this.edges).forEach(([dir, element]) => {
            element.classList.add(EdgeHighlighter.BASE_CLASS_NAME);
            element.classList.add(EdgeHighlighter.BASE_CLASS_NAME + `-${dir}`);
            this.#elementChange(element, false);

            this.viewportEle.appendChild(element);
        });
    }

    #elementChange(element, visible) {
        if (visible) {
            element.style.display = "inline";
        } else {
            element.style.display = "none";
        }
    }

    setEdges(mask) {
        const needChange = mask ^ this.currentMask;
        for (let i = 0; i < 4; i++) {
            if (((needChange >> i) & 1) === 0) continue;
            this.#elementChange(
                this.edges[EdgeHighlighter.BIT_TO_DIR[i]],
                (mask >> i) & 1
            );
        }
        this.currentMask = mask;
    }
}
