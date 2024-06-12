import * as Template from 'wml!ComponentStats/_statsSelector/screens/PageViews/PageViews';

import countCell from '../columns/countCell';
import titleWithDescription from '../columns/titleWithDescription';
import percentCell from '../columns/percentCell';
import { convertDate, getPeriodsForControl, getPeriodsForFilter, getShortDateFormat } from '../helpers';

import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { IColumn, IHeaderCell } from 'Controls/grid';
import { IPeriods } from 'Graphs/baseChart';
import {connectToDataContext, IContextValue} from 'Controls/context';
import {factory} from 'Types/chain'; 
import {factory as collection } from 'Types/collection';
import { calculateFormattedNumber } from 'Controls/_baseDecorator/resources/Number';
import { SyntheticEvent } from 'UICommon/Events';
import { getStableAppUUID } from 'CommonAppMarket/helpers';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { Record } from 'Types/entity';
import { DEFAULT_BLOCK_RESULT_ITEM, INFO_BLOCK_OPTIONS, ITEM_PADDING, SWITCH_GRAPH_ITEMS } from '../consts';
import { IBlockResultItem } from '../interfaces';
import urlPageCell from '../columns/urlPageCell';

const HEADER_CELLS: IHeaderCell[] = [
    {
        caption: 'Страница',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 1,
        endColumn: 3,
        startRow: 1,
        endRow: 2
    },
    {
        caption: 'Заголовок',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 1,
        endColumn: 2,
        startRow: 2,
        endRow: 3
    },
    {
        caption: 'Адрес',
        align: 'center',
        textOverflow: 'ellipsis',
        startColumn: 2,
        endColumn: 3,
        startRow: 2,
        endRow: 3
    },
    {
        caption: 'Просмотры',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 3,
        endColumn: 5,
        startRow: 1,
        endRow: 2,
    },
    {
        caption: '1 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 3,
        endColumn: 4,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: '2 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 4,
        endColumn: 5,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Пользователи',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 5,
        endColumn: 10,
        startRow: 1,
        endRow: 2,
    },
    {
        caption: '1 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 5,
        endColumn: 6,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: '2 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 6,
        endColumn: 7,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Новые',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 7,
        endColumn: 8,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Ушли',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 8,
        endColumn: 9,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Δ %',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 9,
        endColumn: 10,
        startRow: 2,
        endRow: 3,
    },
];

const HEADER_CELL_FIRST_PERIOD = [4, 7];
const HEADER_CELL_SECOND_PERIOD = [5, 8];

const COLUMNS: IColumn[] = [
    {
        displayProperty: 'Name',
        width: '2fr',
        fontSize: 'm',
        align: 'center',
        template: titleWithDescription
    },
    {
        displayProperty: 'ObjectKey1',
        width: '2fr',
        fontSize: 'm',
        align: 'center',
        template: urlPageCell
    },
    {
        displayProperty: 'StatsClicks1',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'StatsClicks2',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'StatsCount1',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'StatsCount2',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'StatsCountIn',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'StatsCountOut',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'StatsDynamics',
        width: '1fr',
        align: 'right',
        fontSize: 'm',
        template: percentCell
    },
];

const INFO_BLOCK_ALIGN_CONFIG = {
    selectors: {
        start: 1,
        end: 2
    },
    prev: {
        start: 2,
        end: 4
    },
    current: {
        start: 4,
        end: 6
    },
    percent: {
        start: 8,
        end: 9
    }
};

const CHART_OPTIONS = {
    chart: {
        type: 'bar',
        marginLeft: 100,
    },
    xAxis: {
        categories: [],
        title: {
            text: null
        },
        labels: {
            style: {
                color: 'var(--label_text-color)',
                fontSize: 'var(--font-size_xs)',
                fontFamily: 'var(--font-family)'
            }
        },
        gridLineWidth: 1,
        lineWidth: 0
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Количество просмотров',
            align: 'high'
        },
        labels: {
            overflow: 'justify'
        },
        gridLineWidth: 0
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true
            },
            groupPadding: 0.1
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'bottom',
        x: -20,
        y: -60,
        floating: true,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        shadow: true
    },
    credits: {
        enabled: false
    },
    series: [{
        name: 'Апрель',
        data: []
    }, {
        name: 'Май',
        data: []
    }]
}

const RESULTS_ITEM = {
    Block1: {
        ...DEFAULT_BLOCK_RESULT_ITEM,
        Title: 'Всего просмотров'
    },
    Block2: {
        ...DEFAULT_BLOCK_RESULT_ITEM,
        Title: 'Всего пользователей'
    },
    Block3: {
        ...DEFAULT_BLOCK_RESULT_ITEM,
        Title: 'Глубина просмотра'
    }
};

const DEFAULT_SWITCH_GRAPH_KEY = SWITCH_GRAPH_ITEMS.at(1).getKey();

interface IPageViewsOptions extends IControlOptions {
    _dataOptionsValue: IContextValue;
}

class PageViews extends Control {
    protected _template: TemplateFunction = Template;

    protected _record: Record<IComponent>;

    protected _defaultInfoBlockOptions = INFO_BLOCK_OPTIONS;

    protected _chartItems: RecordSet;
    protected _chartOptions: object = CHART_OPTIONS;
    protected _chartInfoBlockOptions = INFO_BLOCK_OPTIONS;

    protected _switchGraphItems: RecordSet = SWITCH_GRAPH_ITEMS;
    protected _switchGraphKey: number = DEFAULT_SWITCH_GRAPH_KEY;

    protected _resultsItem: object = RESULTS_ITEM;

    protected _graphData: RecordSet;
    protected _firstPeriodData: number[][];
    protected _secondPeriodData: number[][];
    protected _holidaysData: Boolean[] = [];
    protected _periods: IPeriods;
    protected _summaryData: object;
    protected _infoBlockAlignConfig: object = INFO_BLOCK_ALIGN_CONFIG;

    protected _header: IHeaderCell[] = HEADER_CELLS;
    protected _columns: IColumn[] = COLUMNS;
    protected _itemPadding: object = ITEM_PADDING;
    protected _tableItems: RecordSet;
    protected _isTableLoading: booolean = true;

    protected _beforeMount(options: IPageViewsOptions): void {
        this._record = options.record;

        this._updateTopPagesByUsers(options);
        this._updateGraphData(options);
        this._updateTableItems(options);
    }

    protected _beforeUpdate(options: IPageViewsOptions): void {
        const chartItems = options._dataOptionsValue.pageChart.items;
        const graphData = options._dataOptionsValue.pageGraph.items.at(0);
        const tableItems = options._dataOptionsValue.pageTable.items;

        if (!chartItems?.isEqual(this._chartItems)) {
            this._updateTopPagesByUsers(options);
        }
        if (!graphData?.isEqual(this._graphData)) {
            this._updateGraphData(options);
        }

        if (!tableItems?.isEqual(this._tableItems)) {
            this._updateTableItems(options);
        }

    }

    private _updateGraphData(options: IPageViewsOptions): void {
        const items = options._dataOptionsValue.pageGraph.items.at(0);
        const data = items.get('Data');

        this._graphData = items;
        this._firstPeriodData = data['firstPeriodData'];
        this._secondPeriodData = data['secondPeriodData'];
        this._holidaysData = data['holidaysData'];
        this._summaryData = data['summaryData'];

        this._setPeriodsGraph(options._dataOptionsValue.pageGraph.filter);
        this._resultsItem = {...this._resultsItem, Block2: this._getSumUsers(data)}
        if (this._isGraphAndTableDataLoaded()) {
            this._resultsItem = {...this._resultsItem, Block3: this._getViewsOnUser()};
        }
    }

    private _updateTableItems(options: IPageViewsOptions): void {
        this._tableItems = options._dataOptionsValue.pageTable.items.clone();
        this._isTableLoading = false;
        this._resultsItem = {...this._resultsItem, Block1: this._getSumViews(this._tableItems)};
        if (this._isGraphAndTableDataLoaded()) {
            this._resultsItem = {...this._resultsItem, Block3: this._getViewsOnUser()};
        }
    }

    private _setPeriodsGraph(filter: IPeriods): void {
        this._periods = getPeriodsForControl(filter);

        this._header = this._header.map((cell, index) => {
            if (HEADER_CELL_FIRST_PERIOD.includes(index)) {
                return {...cell, caption: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType)};
            } else if (HEADER_CELL_SECOND_PERIOD.includes(index)) {
                return {...cell, caption: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType)};
            }

            return cell;
        })
    }

    protected _graphPeriodsChanged(e: SyntheticEvent, periods: IPeriods): void {
        const pageGraph = this._options._dataOptionsValue.pageGraph;
        const pageTable = this._options._dataOptionsValue.pageTable;

        this._isTableLoading = true;

        const dates = getPeriodsForFilter(periods);

        pageGraph.setFilter({
            ...pageGraph.filter,
            ...dates
        });
        pageTable.setFilter({
            ...pageTable.filter,
            ...dates
        });
    }

    protected _chartPeriodsChanged(e: SyntheticEvent, periods: IPeriods): void {
        const pageChart = this._options._dataOptionsValue.pageChart;

        const dates = getPeriodsForFilter(periods);

        pageChart.setFilter({
            ...pageChart.filter,
            ...dates
        });
    }

    protected _switchGraphKeyChanged(e: SyntheticEvent, key: number): void {
        const pageGraph = this._options._dataOptionsValue.pageGraph;
        const pageTable = this._options._dataOptionsValue.pageTable;
        const joinStats = key ? 'Account' : 'User';

        this._switchGraphKey = key;
        pageTable.setFilter({
            ...pageTable.filter,
            ByAccount: key,
            JoinStats: joinStats,
            JoinStatsFake: joinStats
        });
        pageGraph.setFilter({
            ...pageGraph.filter,
            JoinStatsFake: joinStats,
            ByAccount: key,
        });
    }

    protected _getHeader(headerTemplate: object[]): object {
        return [...headerTemplate, ...this._header];
    }

    protected _updateTopPagesByUsers(options: IPageViewsOptions): void {
        const filter = options._dataOptionsValue.pageChart.filter;
        this._chartInfoBlockOptions = {
            ...this._chartInfoBlockOptions,
            periods: getPeriodsForControl(filter)
        }
        this._chartItems = options._dataOptionsValue.pageChart.items.clone();

        const items = factory(this._chartItems)
            .sort((firstRecord, secondRecord) => secondRecord.get('StatsClicks2') - firstRecord.get('StatsClicks2'))
            .filter(record => record.get('StatsClicks2') || record.get('StatsClicks1'))
            .first(5)
            .value();

        const categories = items.length ? items.map(record => record.get('Name')) : this._chartOptions.xAxis.categories;
        const emptyArray = [...new Array(categories.length)].fill(0);
        const series = [{
            color: '#434348',
            name: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType),
            data: items.length ? items.map(record => record.get('StatsClicks1')) : emptyArray
        }, {
            color: '#5C94FB',
            name: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType),
            data: items.length ? items.map(record => record.get('StatsClicks2')) : emptyArray
        }];


        this._chartOptions = {
            ...this._chartOptions,
            xAxis: {...this._chartOptions.xAxis, categories},
            series
        }
    }

    private _getSumViews(items: RecordSet): IBlockResultItem {
        const sumViews = {...DEFAULT_BLOCK_RESULT_ITEM, Title: 'Всего просмотров'};
        items.each(item => {
            if (item.get('Parent') === getStableAppUUID(this._record)) {
                sumViews.Value1 += item.get('StatsClicks1');
                sumViews.Value2 += item.get('StatsClicks2');
            }
        })

        sumViews.Percent = Number(((sumViews.Value2 - sumViews.Value1) / sumViews.Value1 * 100).toFixed(1));

        return sumViews;
    }

    private _getSumUsers(data: object): IBlockResultItem {
        const total = data.summaryData.total;

        return {
            Title: 'Всего пользователей',
            Value1: total.first,
            Value2: total.second,
            Percent: Number(((total.second - total.first) / total.first * 100).toFixed(1))
        };
    }

    private _getViewsOnUser(): IBlockResultItem {
        const Value1 = Number(Math.round(this._resultsItem.Block1.Value1 / this._resultsItem.Block2.Value1).toFixed(1));
        const Value2 = Number(Math.round(this._resultsItem.Block1.Value2 / this._resultsItem.Block2.Value2).toFixed(1));

        return {
            Title: 'Глубина просмотра',
            Value1,
            Value2,
            Percent: Number(((Value2 - Value1) / Value1 * 100).toFixed(1))
        }
    }

    private _isGraphAndTableDataLoaded(): boolean {
        return !this._isTableLoading && !this._options._dataOptionsValue?.pageGraph.state.loading;
    }
}

export default connectToDataContext(PageViews);