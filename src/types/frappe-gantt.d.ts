declare module 'frappe-gantt' {
    import React from 'react';

    export interface Task {
        id: string;
        name: string;
        start: string;
        end: string;
        progress?: number;
        dependencies?: string;
        custom_class?: string;
    }

    export interface FrappeGanttProps {
        tasks: Task[];
        viewMode?: 'Day' | 'Week' | 'Month' | 'Quarter';
        onClick?: (task: Task) => void;
        onDateChange?: (task: Task, start: string, end: string) => void;
        onProgressChange?: (task: Task, progress: number) => void;
    }

    export default class FrappeGantt extends React.Component<FrappeGanttProps> {}
}
