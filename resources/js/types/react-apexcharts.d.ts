declare module 'react-apexcharts' {
    import { ApexOptions } from 'apexcharts';
    import { Component } from 'react';

    interface ChartProps {
        options?: ApexOptions;
        series?: ApexOptions['series'];
        type?:
            | 'line'
            | 'area'
            | 'bar'
            | 'pie'
            | 'donut'
            | 'radialBar'
            | 'scatter'
            | 'bubble'
            | 'heatmap'
            | 'candlestick'
            | 'boxPlot'
            | 'radar'
            | 'polarArea'
            | 'rangeBar'
            | 'rangeArea'
            | 'treemap';
        width?: string | number;
        height?: string | number;
    }

    export default class Chart extends Component<ChartProps> {}
}
