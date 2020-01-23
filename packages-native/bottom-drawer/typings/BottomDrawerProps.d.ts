/**
 * This file was generated from BottomDrawer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Team
 */
import { DynamicValue } from "mendix";
import { ReactNode } from "react";

interface CommonProps<Style> {
    name: string;
    style: Style[];
}

export interface SnapPointsType {
    distance: number;
    percentage: boolean;
}

export interface BottomDrawerProps<Style> extends CommonProps<Style> {
    headerContent?: ReactNode;
    mainContent?: ReactNode;
    snapPoints: SnapPointsType[];
    initialSnapPoint: DynamicValue<BigJs.Big>;
}