import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const FrappeGanttLib = dynamic(() => import('frappe-gantt'), { ssr: false });

interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
}

interface FrappeGanttProps {
    tasks: Task[];
    viewMode?: 'Day' | 'Week' | 'Month' | 'Quarter';
}

const FrappeGanttWrapper: React.FC<FrappeGanttProps> = ({ tasks, viewMode }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && tasks.length) {
            // @ts-ignore
            new FrappeGanttLib(containerRef.current, tasks, { view_mode: viewMode || 'Day' });
        }
    }, [tasks, viewMode]);

    return <div ref={containerRef}></div>;
};

export default FrappeGanttWrapper;
