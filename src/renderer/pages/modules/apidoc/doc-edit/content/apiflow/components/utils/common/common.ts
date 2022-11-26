/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/

import { ApidocApiflowNodeInfo } from "@@/store";
import { Coordinate } from "../utils";

type OffsetCoordinate = {
    offsetX: number,
    offsetY: number
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
//返回节点上下左右四个连接点吸附区域
export function getNodeStickyArea(node: ApidocApiflowNodeInfo, stickySize = 10): StickyArea {
    const { styleInfo } = node;
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
    return {
        leftArea: {
            pointX: leftMidPoint.offsetX,
            pointY: leftMidPoint.offsetY,
            offsetX: leftMidPoint.offsetX - stickySize,
            offsetX2: leftMidPoint.offsetX + node.styleInfo.width - stickySize,
            offsetY: node.styleInfo.offsetY + stickySize,
            offsetY2: node.styleInfo.offsetY + node.styleInfo.height - stickySize,
        },
        topArea: {
            pointX: topMidPoint.offsetX,
            pointY: topMidPoint.offsetY,
            offsetX: node.styleInfo.offsetX + stickySize,
            offsetX2: node.styleInfo.offsetX + node.styleInfo.width - stickySize,
            offsetY: topMidPoint.offsetY - stickySize,
            offsetY2: topMidPoint.offsetY + node.styleInfo.height - stickySize,
        },
        rightArea: {
            pointX: rightMidPoint.offsetX,
            pointY: rightMidPoint.offsetY,
            offsetX: rightMidPoint.offsetX - stickySize,
            offsetX2: rightMidPoint.offsetX + stickySize,
            offsetY: node.styleInfo.offsetY + stickySize,
            offsetY2: node.styleInfo.offsetY + node.styleInfo.height - stickySize,
        },
        bottomArea: {
            pointX: bottomMidPoint.offsetX,
            pointY: bottomMidPoint.offsetY,
            offsetX: node.styleInfo.offsetX + stickySize,
            offsetX2: node.styleInfo.offsetX + node.styleInfo.width - stickySize,
            offsetY: bottomMidPoint.offsetY - stickySize,
            offsetY2: bottomMidPoint.offsetY + stickySize,
        },
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
