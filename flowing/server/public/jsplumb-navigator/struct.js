class QuadTree {
    /**
     * Constraint:
     *      'node' need have 'element'(DOM) property
     */
    static NOT_SUBTREE = null;
    static INF = Number.MAX_SAFE_INTEGER;
    static NEG_INF = Number.MIN_SAFE_INTEGER;
    static COLLAPSE_RATE = 0.25;
    static TREE_MIN_WIDTH = 4;
    static TREE_MIN_HEIGHT = 4;

    boundary;
    capacity;
    data = []; //{left, top, node}
    subtree = QuadTree.NOT_SUBTREE; // [quadrant 1 2 3 4]
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
    _collapseCapacity;

    static intersects(rectA, rectB) {
        const { left: aL, top: aT, width: aW, height: aH } = rectA;
        const { left: bL, top: bT, width: bW, height: bH } = rectB;

        if (aW <= 0 || aH <= 0 || bW <= 0 || bH <= 0) return false;

        const aR = aL + aW;
        const aB = aT + aH;
        const bR = bL + bW;
        const bB = bT + bH;

        // aL<aR bL<bR
        // aL<=bL<aR || aL<bR<aR

        return !(aL >= bR || aR <= bL || aT >= bB || aB <= bT);
    }

    static contains(rect, point) {
        const { left: L, top: T, width: W, height: H } = rect;
        const { left, top } = point;
        const R = L + W;
        const B = T + H;
        return L <= left && left < R && T <= top && top < B;
    }

    constructor(boundary, capacity = 8) {
        /**
         * boundary: {left, top, width, height}
         */
        this.boundary = boundary;
        this.capacity = capacity;

        this._collapseCapacity = Math.floor(capacity * QuadTree.COLLAPSE_RATE);
    }

    canDivide() {
        return (
            this.width > QuadTree.TREE_MIN_WIDTH &&
            this.height > QuadTree.TREE_MIN_HEIGHT
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
        if (this.subtree === QuadTree.NOT_SUBTREE) return;
        for (const sub of this.subtree) {
            const { left, top, width, height } = sub.getExtremumBoundary();
            this.updateDataBoundary(left, top, width, height);
        }
    }

    refreshDataBoundary() {
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
        if (dataCount >= this._collapseCapacity) {
            return;
        }

        for (const sub of this.subtree) {
            this.data.push(...sub.data);
        }
        this.subtree = NOT_SUBTREE;
        this.refreshDataBoundary();
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
                left: left + subWidth,
                top: top,
                width: subWidth,
                height: subHeight,
            }),
            new QuadTree({
                left: left,
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

        for (const { left, top, node } of this.data) {
            for (const sub of this.subtree) {
                if (sub.contains(left, top)) {
                    sub.insert(left, top, node);
                    break;
                }
            }
        }
        this.data = [];
    }

    insert(left, top, node) {
        if (!this.contains(left, top)) return false;

        if (
            this.subtree === QuadTree.NOT_SUBTREE &&
            (this.data.length < this.capacity || !this.canDivide())
        ) {
            this.data.push({
                left: left,
                top: top,
                node: node,
            });

            this.updateDataBoundary(
                left,
                top,
                node.element.offsetWidth,
                node.element.offsetHeight
            );

            return true;
        }

        if (this.subtree === QuadTree.NOT_SUBTREE) {
            this.subdivide();
        }

        const inserted = this.subtree.some((sub) =>
            sub.insert(left, top, node)
        );
        if (inserted) {
            this.maintainDataBoundary();
        }

        return inserted;
    }

    remove(node) {
        if (this.subtree !== QuadTree.NOT_SUBTREE) {
            const deleted = this.subtree.some((sub) => sub.remove(node));
            if (deleted) {
                this.maintainDataBoundary();
                this.maintainSubTree();
            }
            return deleted;
        }

        let idx = -1;
        for (const [i, info] of this.data.entries()) {
            if (info.node === node) {
                idx = i;
                break;
            }
        }
        if (idx !== -1) {
            this.data.splice(idx, 1);
            this.refreshDataBoundary();
            return true;
        }
        return false;
    }

    update(left, top, node) {
        this.remove(node);
        this.insert(left, top, node);
    }

    query(left, top, width, height, res = []) {
        if (!this.intersects(left, top, width, height)) return [];

        if (this.subtree !== QuadTree.NOT_SUBTREE) {
            this.subtree.forEach((sub) =>
                sub.query(left, top, width, height, res)
            );
        } else {
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
        }
        return res;
    }
}
