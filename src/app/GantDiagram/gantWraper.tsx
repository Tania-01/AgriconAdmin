'use client';

import { useEffect, useRef } from 'react';

interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
}

interface GanttWrapperProps {
    tasks: Task[];
    viewMode?: 'Day' | 'Week' | 'Month';
}

export default function GanttWrapper({ tasks, viewMode }: GanttWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadGantt = async () => {
            const { default: FrappeGantt } = await import('frappe-gantt');
            if (containerRef.current && tasks.length) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore FrappeGantt не має типів
                new FrappeGantt(containerRef.current, tasks, {
                    view_mode: viewMode || 'Day',
                });
            }
        };

        loadGantt();
    }, [tasks, viewMode]);

    return <div ref={containerRef}></div>;
}
