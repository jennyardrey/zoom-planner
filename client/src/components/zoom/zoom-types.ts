export type ZoomLevel = 'year' | 'month' | 'week' | 'day' | 'hour';

export const ZOOM_LEVELS: ZoomLevel[] = ['year', 'month', 'week', 'day', 'hour'];

export interface ZoomState {
    zoomLevel: ZoomLevel;
    focusDate: Date;
    focusHour: number | null; // 0-23 or null if not focused on specific hour
    direction: 'in' | 'out' | null; // For animation direction
}

export interface ZoomContextType extends ZoomState {
    setZoomLevel: (level: ZoomLevel) => void;
    setFocusDate: (date: Date) => void;
    setFocusHour: (hour: number | null) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
}
