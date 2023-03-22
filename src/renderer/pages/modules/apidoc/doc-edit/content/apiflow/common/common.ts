import { useFlowConfigStore } from "@/store/apiflow/config";
import { FlowLineInfo, FlowLinePosition, FlowNodeInfo, FlowValidCreateLineArea, FlowValidResizeArea } from "@@/apiflow";
import { getQuardantInfo } from "./quadrant/quardant";
import { getQuardantInfo2 } from "./quadrant2/quadrant2";
import { getQuardantInfo3 } from "./quadrant3/quadrant3";
import { getQuardantInfo4 } from "./quadrant4/quadrant4";

export type Coordinate = {
    x: number,
    y: number
}
export type DrawInfoOptions = {
    fromNode: FlowNodeInfo,
    currendLine?: FlowLineInfo,
    fromPosition: FlowLinePosition
}
export type DrawInfo = {
    x: number,
    y: number,
    width: number,
    height: number,
    lineInfo: {
        cpx: number,
        cpy: number,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        activeColor?: string,
        arrowInfo: {
            leftTopPoint: Coordinate,
            rightBottomPoint: Coordinate,
            p1: Coordinate,
            p2: Coordinate,
            p3: Coordinate,
        },
        /**
         * 折线控制点
         */
        brokenLinePoints: Coordinate[],
    },
    /**
     * 是否连接到别的节点
     */
    isConnectedNode: boolean,
    /**
     * 连接到节点位置
     */
    connectedPosition: "left" | "top" | "right" | "bottom"
    /**
     * 被连接的节点id
     */
    connectedNodeId: string,
}
export type LineConfig = {
    /**
     * 线条与canvas容器之间的安全距离
     */
    padding: number,
    /**
     * 箭头长度
     */
    arrowLength: number,
    /**
     * 箭头宽度
     */
    arrowWidth: number,
    /**
     * 折线吸附阈值
     */
    breakLineSticky: number,
    /**
     * 折现与节点之间间隙
     */
    breakLineOffsetNode: number,
}
/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/
type OffsetCoordinate = {
    offsetX: number,
    offsetY: number
}
type StickyAreaPosition = {
    stickySize?: number,
    startPoint: Coordinate
}
type Position = "left" | "top" | "right" | "bottom"

export type StickyArea = {
    leftArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    topArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    rightArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    bottomArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
}
export type ResizeDotArea = {
    leftTopArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    rightTopArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    leftBottomArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    rightBottomArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
}
//返回节点上下左右四个连接点吸附区域
export function getNodeStickyArea(toNode: FlowNodeInfo, options: StickyAreaPosition): StickyArea {
    const { styleInfo } = toNode;
    const { stickySize = 10, startPoint } = options
    const leftMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX,
        offsetY: styleInfo.offsetY + styleInfo.height / 2
    }
    const topMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX + styleInfo.width / 2,
        offsetY: styleInfo.offsetY
    }
    const rightMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX + styleInfo.width,
        offsetY: styleInfo.offsetY + styleInfo.height / 2
    }
    const bottomMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX + styleInfo.width / 2,
        offsetY: styleInfo.offsetY + styleInfo.height
    }
    const leftArea = {
        pointX: leftMidPoint.offsetX,
        pointY: leftMidPoint.offsetY,
        offsetX: leftMidPoint.offsetX - stickySize,
        offsetX2: leftMidPoint.offsetX + stickySize,
        offsetY: styleInfo.offsetY + stickySize,
        offsetY2: styleInfo.offsetY + styleInfo.height - stickySize,
    };
    const rightArea = {
        pointX: rightMidPoint.offsetX,
        pointY: rightMidPoint.offsetY,
        offsetX: rightMidPoint.offsetX - stickySize,
        offsetX2: rightMidPoint.offsetX + stickySize,
        offsetY: styleInfo.offsetY + stickySize,
        offsetY2: styleInfo.offsetY + styleInfo.height - stickySize,
    }
    const topArea = {
        pointX: topMidPoint.offsetX,
        pointY: topMidPoint.offsetY,
        offsetX: styleInfo.offsetX + stickySize,
        offsetX2: styleInfo.offsetX + styleInfo.width - stickySize,
        offsetY: topMidPoint.offsetY - stickySize,
        offsetY2: topMidPoint.offsetY + stickySize,
    }
    const bottomArea = {
        pointX: bottomMidPoint.offsetX,
        pointY: bottomMidPoint.offsetY,
        offsetX: styleInfo.offsetX + stickySize,
        offsetX2: styleInfo.offsetX + styleInfo.width - stickySize,
        offsetY: bottomMidPoint.offsetY - stickySize,
        offsetY2: bottomMidPoint.offsetY + stickySize,
    }
    const stickyFactor = 0.618
    const toNodeIsOnRightSide = styleInfo.offsetX > startPoint.x;
    const toNodeIsOnTopSide = styleInfo.offsetY < startPoint.y;
    if (toNodeIsOnRightSide && toNodeIsOnTopSide) {
        const gapX = Math.abs(styleInfo.offsetX - startPoint.x);
        const gapY = Math.abs(styleInfo.offsetY + styleInfo.height - startPoint.y);
        if (gapX > gapY * stickyFactor) {
            leftArea.offsetX2 = leftMidPoint.offsetX + styleInfo.width - stickySize
        } else {
            bottomArea.offsetY = styleInfo.offsetY + stickySize
        }
    } else if (!toNodeIsOnRightSide && toNodeIsOnTopSide) {
        const gapX = Math.abs(styleInfo.offsetX + styleInfo.width - startPoint.x);
        const gapY = Math.abs(styleInfo.offsetY + styleInfo.height - startPoint.y);
        if (gapX > gapY * stickyFactor) {
            rightArea.offsetX = leftMidPoint.offsetX + stickySize
        } else {
            bottomArea.offsetY = styleInfo.offsetY + stickySize
        }
    } else if (toNodeIsOnRightSide && !toNodeIsOnTopSide) {
        const gapX = Math.abs(startPoint.x - styleInfo.offsetX);
        const gapY = Math.abs(startPoint.y - styleInfo.offsetY);
        if (gapX > gapY * stickyFactor) {
            leftArea.offsetX2 = leftMidPoint.offsetX + styleInfo.width - stickySize
        } else {
            topArea.offsetY2 = bottomMidPoint.offsetY - stickySize
        }
    } else if (!toNodeIsOnRightSide && !toNodeIsOnTopSide) {
        const gapX = Math.abs(styleInfo.offsetX + styleInfo.width - startPoint.x);
        const gapY = Math.abs(startPoint.y - styleInfo.offsetY);
        if (gapX > gapY * stickyFactor) {
            rightArea.offsetX = leftMidPoint.offsetX + stickySize
        } else {
            topArea.offsetY2 = bottomMidPoint.offsetY - stickySize
        }
    }
    return {
        leftArea,
        topArea,
        rightArea,
        bottomArea,
    };
}
export const getLineStickyPosition = (point: Coordinate, stickyArea: StickyArea): Position | null => {
    const isLineXInLeftStickyArea = point.x >= stickyArea.leftArea.offsetX && point.x <= stickyArea.leftArea.offsetX2;
    const isLineYInLeftStickyArea = point.y >= stickyArea.leftArea.offsetY && point.y <= stickyArea.leftArea.offsetY2;
    const isLineXInTopStickyArea = point.x >= stickyArea.topArea.offsetX && point.x <= stickyArea.topArea.offsetX2;
    const isLineYInTopStickyArea = point.y >= stickyArea.topArea.offsetY && point.y <= stickyArea.topArea.offsetY2;
    const isLineXInBottomStickyArea = point.x >= stickyArea.bottomArea.offsetX && point.x <= stickyArea.bottomArea.offsetX2;
    const isLineYInBottomStickyArea = point.y >= stickyArea.bottomArea.offsetY && point.y <= stickyArea.bottomArea.offsetY2;
    const isLineXInRightStickyArea = point.x >= stickyArea.rightArea.offsetX && point.x <= stickyArea.rightArea.offsetX2;
    const isLineYInRightStickyArea = point.y >= stickyArea.rightArea.offsetY && point.y <= stickyArea.rightArea.offsetY2;
    if (isLineXInLeftStickyArea && isLineYInLeftStickyArea) {
        return "left"
    }
    if (isLineXInTopStickyArea && isLineYInTopStickyArea) {
        return "top"
    }
    if (isLineXInBottomStickyArea && isLineYInBottomStickyArea) {
        return "bottom"
    }
    if (isLineXInRightStickyArea && isLineYInRightStickyArea) {
        return "right"
    }
    return null;
}
export const getContraryPosition = (position: Position): Position => {
    if (position === "left") {
        return "right"
    }
    if (position === "right") {
        return "left"
    }
    if (position === "top") {
        return "bottom"
    }
    if (position === "bottom") {
        return "top"
    }
    return "left"
}

export function getCreateLineArea(nodeInfo: FlowNodeInfo): FlowValidCreateLineArea {
    const configStore = useFlowConfigStore()
    const { createLineDotSize } = configStore
    const leftArea = {
        pointX: nodeInfo.styleInfo.offsetX,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2,
        offsetX: nodeInfo.styleInfo.offsetX - createLineDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + createLineDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 - createLineDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 + createLineDotSize / 2,
    }
    const rightArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width - createLineDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width + createLineDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 - createLineDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 + createLineDotSize / 2,
    }
    const topArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2,
        pointY: nodeInfo.styleInfo.offsetY,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 - createLineDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 + createLineDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY - createLineDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + createLineDotSize / 2,
    }
    const bottomArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 - createLineDotSize,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 + createLineDotSize,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height - createLineDotSize,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height + createLineDotSize,
    }
    return {
        leftArea,
        rightArea,
        topArea,
        bottomArea
    }
}
export function getResizeBarArea(nodeInfo: FlowNodeInfo): FlowValidResizeArea {
    const configStore = useFlowConfigStore()
    const { resizeDotSize } = configStore
    const leftTopArea = {
        pointX: nodeInfo.styleInfo.offsetX,
        pointY: nodeInfo.styleInfo.offsetY,
        offsetX: nodeInfo.styleInfo.offsetX - resizeDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + resizeDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY - resizeDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + resizeDotSize / 2,
    }
    const rightTopArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width,
        pointY: nodeInfo.styleInfo.offsetY,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width - resizeDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width + resizeDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY - resizeDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + resizeDotSize / 2,
    }
    const leftBottomArea = {
        pointX: nodeInfo.styleInfo.offsetX,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height,
        offsetX: nodeInfo.styleInfo.offsetX - resizeDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + resizeDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height - resizeDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height + resizeDotSize / 2,
    }
    const rightBottomArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width - resizeDotSize / 2,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width + resizeDotSize / 2,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height - resizeDotSize / 2,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height + resizeDotSize / 2,
    }
    return {
        leftTopArea,
        rightTopArea,
        leftBottomArea,
        rightBottomArea
    }
}

export function getDrawInfoByPoint(startPoint: Coordinate, endPoint: Coordinate, options: DrawInfoOptions): DrawInfo {
    const result: DrawInfo = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        lineInfo: {
            cpx: 0,
            cpy: 0,
            startX: 0,
            activeColor: "#333",
            startY: 0,
            endX: 0,
            endY: 0,
            arrowInfo: {
                leftTopPoint: {
                    x: 0,
                    y: 0,
                },
                rightBottomPoint: {
                    x: 0,
                    y: 0,
                },
                p1: {
                    x: 0,
                    y: 0,
                },
                p2: {
                    x: 0,
                    y: 0,
                },
                p3: {
                    x: 0,
                    y: 0,
                },
            },
            brokenLinePoints: [],
        },
        isConnectedNode: false,
        connectedPosition: "left",
        connectedNodeId: ""
    }
    const lineConfig: LineConfig = {
        padding: 15, //绘制图形边距
        arrowLength: 15, //箭头长度, 箭头长度不能超过绘制图形边距
        arrowWidth: 5, //箭头宽度
        breakLineSticky: 5, //折线吸附阈值
        breakLineOffsetNode: 25, //折现与节点之间间隙
    }
    if (Math.abs(endPoint.x - startPoint.x) < 10 && Math.abs(endPoint.y - startPoint.y) < 10) {
        return result
    }
    if (endPoint.x > startPoint.x && endPoint.y <= startPoint.y) { //第一象限(startPostion为原点)
        getQuardantInfo(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    } else if (endPoint.x <= startPoint.x && endPoint.y <= startPoint.y) { //第二象限
        getQuardantInfo2(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    } else if (endPoint.x <= startPoint.x && endPoint.y > startPoint.y) { //第三象限
        getQuardantInfo3(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    } else if (endPoint.x > startPoint.x && endPoint.y > startPoint.y) { //第四象限
        getQuardantInfo4(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    }
    return result;
}
//获取zIndex值
let zIndex = 0;
export function getZIndex(): number {
    zIndex += 1;
    return zIndex;
}
export const mouseIsInLine = (e: MouseEvent, lineInfo: FlowLineInfo): boolean => {
    const { canHoverPosition } = lineInfo;
    for (let i = 0; i < canHoverPosition.length; i += 1) {
        const position = canHoverPosition[i];
        const x1 = position.leftTopPosition.clientX;
        const x2 = position.rightBottomPosition.clientX;
        const y1 = position.leftTopPosition.clientY;
        const y2 = position.rightBottomPosition.clientY;
        if (e.clientX >= x1 && e.clientX <= x2 && e.clientY >= y1 && e.clientY <= y2) {
            return true
        }
    }
    return false;
}
