import * as Template from 'wml!ComponentStats/_statsSelector/screens/RegionStats/RegionStats';
import * as titleWidthLegendTemplate from 'wml!ComponentStats/_statsSelector/columns/titleWithLegend';

import countCell from '../columns/countCell';
import titleWithDescription from '../columns/titleWithDescription';
import percentCell from '../columns/percentCell';
import { getPeriodsForControl, getPeriodsForFilter, getShortDateFormat } from '../helpers';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { EXPORT_ITEMS, INFO_BLOCK_OPTIONS, ITEM_PADDING } from '../consts';

import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { IColumn, IHeaderCell } from 'Controls/grid';
import { IPeriods } from 'Graphs/baseChart';
import { legend } from 'Graphs/DonutChartWithTable';
import {connectToDataContext, IContextValue} from 'Controls/context';
import {factory} from 'Types/chain';
import { SyntheticEvent } from 'UICommon/Events';
import {  Model, Record } from 'Types/entity';
import ExportController from 'Export/Controller';

const HEADER_CELLS: IHeaderCell[] = [
    {
        caption: 'Название региона и код',
        textOverflow: 'ellipsis',
        valign: 'center',
        startColumn: 1,
        endColumn: 2,
        startRow: 1,
        endRow: 3
    },
    {
        caption: 'Действия',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 2,
        endColumn: 4,
        startRow: 1,
        endRow: 2,
    },
    {
        caption: '1 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 2,
        endColumn: 3,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: '2 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 3,
        endColumn: 4,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Организации',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 4,
        endColumn: 9,
        startRow: 1,
        endRow: 2,
    },
    {
        caption: '1 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 4,
        endColumn: 5,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: '2 период',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 5,
        endColumn: 6,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Новые',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 6,
        endColumn: 7,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Ушли',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 7,
        endColumn: 8,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Δ %',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 8,
        endColumn: 9,
        startRow: 2,
        endRow: 3,
    },
];

const HEADER_CELL_FIRST_PERIOD = [2, 5];
const HEADER_CELL_SECOND_PERIOD = [3, 6];

const HEADER_TOP_CELLS: IHeaderCell[] = [
    {
        caption: 'Название региона',
        textOverflow: 'ellipsis',
    },
    {
        caption: 'Май 24',
        textOverflow: 'ellipsis',
    },
]

const TOP_COLUMNS: IColumn[] = [
    {
        displayProperty: 'name',
        width: '230px',
        template: titleWidthLegendTemplate
    },
    {
        displayProperty: 'value',
        width: '1fr',
        template: countCell,
        align: 'right'
    }
];

const COLUMNS: IColumn[] = [
    {
        displayProperty: 'Name',
        width: '2.6fr',
        fontSize: 'm',
        template: titleWithDescription
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

const CHART_OPTIONS_TOTAL_CLIENTS = {
    chart: {
        type: 'column',
        width: 260
    },
    xAxis: {
        categories: []
    },
    yAxis: {
        title: {
            text: ''
        }
    },
    legend: {
        enabled: false
    },
    tooltip: {
        pointFormat: 'Клиентов: <b>{point.y}</b>'
    },
    title: {
        text: ''
    },
    series: [{
        colors: ['#434348', '#5C94FB', '#FAA75A'],
        showInLegend: false,
        colorByPoint: true,
        data: []
    }]
}

const CHART_OPTIONS_TOP_CLIENTS = {
    chart: {
        type: 'bar',
        marginLeft: 150,
        width: 645
    },
    xAxis: {
        categories: ['Авто', 'Тензор', 'Inside'],
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
            text: 'Количество действий',
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

interface IRegionStatsOptions extends IControlOptions {
    _dataOptionsValue: IContextValue;
}

class RegionStats extends Control {
    protected _template: TemplateFunction = Template;

    protected _record: Record<IComponent>;

    protected _infoBlockOptions = INFO_BLOCK_OPTIONS;

    protected _chartData: object[] = [];

    protected _periodsTotal: IPeriods;
    protected _totalClientsItems: RecordSet;
    protected _chartOptionsTotalClients = CHART_OPTIONS_TOTAL_CLIENTS;

    protected _firstTopItems: RecordSet;
    protected _secondTopItems: RecordSet;
    protected _topColumns: IColumn[] = TOP_COLUMNS;
    protected _topHeader: IHeaderCell[] = HEADER_TOP_CELLS;

    protected _exportItems: RecordSet = EXPORT_ITEMS;

    protected _regionTableItems: RecordSet;
    protected _chartOptionsTopClients = CHART_OPTIONS_TOP_CLIENTS;

    protected _header: IHeaderCell[] = HEADER_CELLS;
    protected _columns: IColumn[] = COLUMNS;
    protected _itemPadding: object = ITEM_PADDING;
    protected _tableItems: RecordSet;
    protected _periodsTable: IPeriods;

    protected _beforeMount(options: IRegionStatsOptions): void {
        this._reloadItems = this._reloadItems.bind(this);
        this._record = options.record;

        this._updateTableItems(options);
    }

    protected _beforeUpdate(options: IRegionStatsOptions): void {
        if (!options.record?.isEqual(this._record)) {
            this._record = options.record;
        }

        const tableItems = options._dataOptionsValue.regionTable.items;

        if (!tableItems?.isEqual(this._tableItems)) {
            this._updateTableItems(options);
        }

    }

    private _updateTotalClientsItems(options: IRegionStatsOptions): void {
        const filter = options._dataOptionsValue.clientsTotal.filter;
        const items = options._dataOptionsValue.clientsTotal.items.at(0)
        const total = items.get('Data').summaryData.total;
        this._totalClientsItems = items;

        const categories = [
            getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType),
            getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType)
        ];
        const data = [total.first, total.second];
        this._chartOptionsTotalClients = {
            ...this._chartOptionsTotalClients,
            xAxis: {categories},
            series: [{ ...this._chartOptionsTotalClients.series[0], data }]
        }

        this._setPeriodsTotal(options._dataOptionsValue.clientsTotal.filter);
    }

    private _updateTableItems2(options: IRegionStatsOptions): void {
        const filter = options._dataOptionsValue.clientsTop.filter;
        this._tableItems = options._dataOptionsValue.clientsTop.items.clone();

        const items = factory(this._regionTableItems)
            .filter(record => record.get('Clicks2') || record.get('Clicks1'))
            .first(5)
            .value();

        const categories = items.length ? items.map(record => record.get('Name')) : this._chartOptions.xAxis.categories;
        const emptyArray = [...new Array(categories.length)].fill(0);
        const series = [{
            color: '#434348',
            name: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType),
            data: items.length ? items.map(record => record.get('Clicks2')) : emptyArray
        }, {
            color: '#5C94FB',
            name: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType),
            data: items.length ? items.map(record => record.get('Clicks1')) : emptyArray
        }];


        this._chartOptionsTopClients = {
            ...this._chartOptionsTopClients,
            xAxis: {...this._chartOptionsTopClients.xAxis, categories},
            series
        }
    }

    private _updateTableItems(options: IRegionStatsOptions): void {
        this._tableItems = options._dataOptionsValue.regionTable.items.clone();

        this._setPeriodsTable(options._dataOptionsValue.regionTable.filter);
        this._updateChartData(options);
    }

    private _updateChartData(options: IRegionStatsOptions): void {
        const items = factory(this._tableItems)
            .sort((firstRecord, secondRecord) => secondRecord.get('StatsClicks2') - firstRecord.get('StatsClicks2'))
            .filter(record => record.get('StatsClicks2') || record.get('StatsClicks1'))
            .first(10)
            .value();

        this._chartData = items.map(record => ({name: record.get('Name'), value: record.get('StatsClicks2'), id: record.get('ID')}));

        this._updateTopItems(options);
    }

    private _updateTopItems(options: IRegionStatsOptions): void {
        const filter = options._dataOptionsValue.regionTable.filter;
        const items = this._chartData.map((item, index) => ({...item, colorIndex: index + 1, legend}));

        this._topHeader = this._topHeader.map((cell, index) => {
            if (index === 1) {
                return {...cell, caption: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType)}
            }

            return cell;
        })

        this._firstTopItems = new RecordSet({
            keyProperty: 'id',
            rawData: items.slice(0,5)
        });

        this._secondTopItems = new RecordSet({
            keyProperty: 'id',
            rawData: items.slice(5)
        });
    }

    private _setPeriodsTotal(filter: IPeriods): void {
        this._periodsTotal = getPeriodsForControl(filter);
    }

    private _setPeriodsTable(filter: IPeriods): void {
        this._periodsTable = getPeriodsForControl(filter);

        this._header = this._header.map((cell, index) => {
            if (HEADER_CELL_FIRST_PERIOD.includes(index)) {
                return {...cell, caption: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType)};
            } else if (HEADER_CELL_SECOND_PERIOD.includes(index)) {
                return {...cell, caption: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType)};
            }

            return cell;
        });
    }

    protected _periodsChangedTable(e: SyntheticEvent, periods: IPeriods): void {
        const regionTable = this._options._dataOptionsValue.regionTable;

        const dates = getPeriodsForFilter(periods);

        regionTable.setFilter({
            ...regionTable.filter,
            ...dates
        });
    }

    protected _periodsChangedChart(e: SyntheticEvent, periods: IPeriods): void {
        const clientsTotal = this._options._dataOptionsValue.clientsTotal;
        const clientsTop = this._options._dataOptionsValue.clientsTop;

        const dates = getPeriodsForFilter(periods);

        clientsTotal.setFilter({
            ...clientsTotal.filter,
            ...dates
        });

        clientsTop.setFilter({
            ...clientsTop.filter,
            ...dates
        });
    }

    protected _exportItemActivated(event: Event, item: Model): void {
        const source = this._options._dataOptionsValue.regionTable.source;
        const filter = this._options._dataOptionsValue.regionTable.filter;
        const firstDate = getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType);
        const secondDate = getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType);

        const providerName = item.getKey() == '1' ? undefined : 'Export/PDFProvider';

        const exportController = new ExportController({
            providerName,
            columns: [
                {
                    field: 'Name',
                    title: 'Регион и код'
                },
                {
                    field: 'StatsClicks1',
                    title: `Действий за ${firstDate}`
                },
                {
                    field: 'StatsClicks2',
                    title: `Действий за ${secondDate}`
                },
                {
                    field: 'StatsCount1',
                    title: `Орг. за ${firstDate}`
                },
                {
                    field: 'StatsCount2',
                    title: `Орг. за ${secondDate}`
                },
                {
                    field: 'StatsCountIn',
                    title: 'Новых'
                },
                {
                    field: 'StatsCountOut',
                    title: 'Ушли'
                },
                {
                    field: 'StatsDynamics',
                    title: 'Δ %'
                },
            ],
            source,
            filter,
            fileName: `Статистика по регионам за ${firstDate}-${secondDate}`
        });
        exportController.execute();
    }

    protected _reloadItems(): void {
        return this._options._dataOptionsValue?.regionTable.reload();
    }
}

export default connectToDataContext(RegionStats);