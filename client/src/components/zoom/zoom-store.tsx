import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { format, parse, getYear, getMonth, getDate, getHours, isSameDay } from "date-fns";
import { ZoomLevel, ZOOM_LEVELS, ZoomContextType } from "./zoom-types";

const ZoomContext = createContext<ZoomContextType | null>(null);

export function ZoomProvider({ children }: { children: React.ReactNode }) {
    const [location, setLocation] = useLocation();

    // Internal State
    const [zoomLevel, setZoomLevelState] = useState<ZoomLevel>('week');
    const [focusDate, setFocusDateState] = useState<Date>(new Date());
    const [focusHour, setFocusHourState] = useState<number | null>(null);
    const [direction, setDirection] = useState<'in' | 'out' | null>(null);

    // Keep track of previous level for direction calculation
    const prevLevelRef = useRef<ZoomLevel>('week');

    // Direction calculation based on state changes (which come from URL)
    useEffect(() => {
        const levelIndex = ZOOM_LEVELS.indexOf(zoomLevel);
        const prevIndex = ZOOM_LEVELS.indexOf(prevLevelRef.current);

        if (levelIndex > prevIndex) setDirection('in');
        else if (levelIndex < prevIndex) setDirection('out');
        else setDirection(null);

        prevLevelRef.current = zoomLevel;
    }, [zoomLevel]);

    // Route matchers to sync URL -> State (Initial load or browser back/forward)
    const [matchYear, paramsYear] = useRoute("/year/:year");
    const [matchMonth, paramsMonth] = useRoute("/month/:yearMonth");
    const [matchWeek, paramsWeek] = useRoute("/week/:date");
    const [matchDay, paramsDay] = useRoute("/day/:date");
    const [matchHour, paramsHour] = useRoute("/day/:date/hour/:hour");

    // Base route matchers (clicked from Sidebar)
    const [matchYearBase] = useRoute("/year");
    const [matchMonthBase] = useRoute("/month");
    const [matchWeekBase] = useRoute("/week");
    const [matchDayBase] = useRoute("/day");

    useEffect(() => {
        let targetLevel: ZoomLevel = zoomLevel;
        let targetDate: Date = focusDate;
        let targetHour: number | null = focusHour;

        if (matchHour && paramsHour) {
            targetLevel = 'hour';
            targetDate = parse(paramsHour.date, 'yyyy-MM-dd', new Date());
            targetHour = parseInt(paramsHour.hour, 10);
        } else if (matchDay && paramsDay) {
            targetLevel = 'day';
            targetDate = parse(paramsDay.date, 'yyyy-MM-dd', new Date());
            targetHour = null;
        } else if (matchWeek && paramsWeek) {
            targetLevel = 'week';
            targetDate = parse(paramsWeek.date, 'yyyy-MM-dd', new Date());
            targetHour = null;
        } else if (matchMonth && paramsMonth) {
            targetLevel = 'month';
            targetDate = parse(paramsMonth.yearMonth + "-01", 'yyyy-MM-dd', new Date());
            targetHour = null;
        } else if (matchYear && paramsYear) {
            targetLevel = 'year';
            targetDate = parse(paramsYear.year + "-01-01", 'yyyy-MM-dd', new Date());
            targetHour = null;
        }
        // Handle base routes
        else if (matchDayBase) {
            targetLevel = 'day';
        } else if (matchWeekBase) {
            targetLevel = 'week';
        } else if (matchMonthBase) {
            targetLevel = 'month';
        } else if (matchYearBase) {
            targetLevel = 'year';
        } else {
            // No match? Do nothing, or maybe we are at root usually
            return;
        }

        // Apply changes only if different
        if (targetLevel !== zoomLevel) {
            setZoomLevelState(targetLevel);
        }

        if (!isSameDay(targetDate, focusDate)) {
            setFocusDateState(targetDate);
        }

        if (targetHour !== focusHour) {
            setFocusHourState(targetHour);
        }

    }, [
        matchYear, matchMonth, matchWeek, matchDay, matchHour,
        paramsYear, paramsMonth, paramsWeek, paramsDay, paramsHour,
        matchYearBase, matchMonthBase, matchWeekBase, matchDayBase,
        // Add state dependencies to compare against
        zoomLevel, focusDate, focusHour
    ]);

    // Actions
    // Helper to construct path
    const getPath = (level: ZoomLevel, date: Date, hour: number | null) => {
        const y = getYear(date);
        const m = getMonth(date) + 1;
        const d = getDate(date);
        const dateStr = format(date, 'yyyy-MM-dd');

        switch (level) {
            case 'year': return `/year/${y}`;
            case 'month': return `/month/${y}-${String(m).padStart(2, '0')}`;
            case 'week': return `/week/${dateStr}`;
            case 'day': return `/day/${dateStr}`;
            case 'hour':
                const h = hour !== null ? hour : getHours(new Date());
                return `/day/${dateStr}/hour/${h}`;
        }
    };

    // Actions now update URL directly
    const setZoomLevel = (level: ZoomLevel) => {
        const path = getPath(level, focusDate, focusHour);
        setLocation(path);
    };

    const setFocusDate = (date: Date) => {
        const path = getPath(zoomLevel, date, focusHour);
        setLocation(path);
    };

    const setFocusHour = (hour: number | null) => {
        const path = getPath(zoomLevel, focusDate, hour);
        setLocation(path);
    };

    const zoomIn = () => {
        const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
        if (currentIndex < ZOOM_LEVELS.length - 1) {
            setZoomLevel(ZOOM_LEVELS[currentIndex + 1]);
        }
    };

    const zoomOut = () => {
        const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
        if (currentIndex > 0) {
            setZoomLevel(ZOOM_LEVELS[currentIndex - 1]);
        }
    };

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

    return (
        <ZoomContext.Provider value={{
            zoomLevel,
            focusDate,
            focusHour,
            direction,
            setZoomLevel,
            setFocusDate,
            setFocusHour,
            zoomIn,
            zoomOut,
            isDrawerOpen,
            openDrawer,
            closeDrawer,
            toggleDrawer
        }}>
            {children}
        </ZoomContext.Provider>
    );
}

export function useZoom() {
    const context = useContext(ZoomContext);
    if (!context) {
        throw new Error("useZoom must be used within a ZoomProvider");
    }
    return context;
}
