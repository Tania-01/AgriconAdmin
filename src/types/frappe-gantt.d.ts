declare module 'frappe-gantt' {
    export interface Task {
        id: string;
        name: string;
        start: string | Date;
        end: string | Date;
        progress: number;
        dependencies?: string;
    }

    export interface FrappeGanttOptions {
        header_height?: number;
        column_width?: number;
        step?: number;
        view_modes?: string[];
        bar_height?: number;
        bar_corner_radius?: number;
        arrow_curve?: number;
        padding?: number;
        view_mode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
        date_format?: string;
        custom_popup_html?: (task: Task) => string;
        language?: string;
    }

    export default class FrappeGantt {
        constructor(
            wrapper: HTMLElement,
            tasks: Task[],
            options?: FrappeGanttOptions
        );
        change_view_mode(mode: string): void;
        refresh(tasks: Task[]): void;
    }
}
