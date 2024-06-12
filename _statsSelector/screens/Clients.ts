import * as Template from 'wml!ComponentStats/_statsSelector/screens/Clients/Clients';

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
import { SyntheticEvent } from 'UICommon/Events';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import {  Model, Record } from 'Types/entity';
import { DEFAULT_BLOCK_RESULT_ITEM, EXPORT_ITEMS, INFO_BLOCK_OPTIONS, ITEM_PADDING, SWITCH_GRAPH_ITEMS } from '../consts';
import ExportController from 'Export/Controller';
import { Memory } from 'Types/source';

const HEADER_CELLS: IHeaderCell[] = [
    {
        caption: 'Название организации',
        textOverflow: 'ellipsis',
        startColumn: 1,
        endColumn: 2,
        startRow: 1,
        endRow: 3,
    },
    {
        caption: 'Действия',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 2,
        endColumn: 5,
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
        caption: 'Δ %',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 4,
        endColumn: 5,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Лицензия',
        textOverflow: 'ellipsis',
        align: 'center',
        startColumn: 5,
        endColumn: 8,
        startRow: 1,
        endRow: 2,
    },
    {
        caption: 'Куплена',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 5,
        endColumn: 6,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Заканчивается',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 6,
        endColumn: 7,
        startRow: 2,
        endRow: 3,
    },
    {
        caption: 'Осталось',
        textOverflow: 'ellipsis',
        align: 'right',
        startColumn: 7,
        endColumn: 8,
        startRow: 2,
        endRow: 3,
    },
];

const COLUMNS: IColumn[] = [
    {
        displayProperty: 'Name',
        width: '2.6fr',
        fontSize: 'm',
        template: titleWithDescription,
        templateOptions: {
            additionalProperty: 'RegionName'
        }
    },
    {
        displayProperty: 'Clicks1',
        width: '0.95fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'Clicks2',
        width: '1fr',
        align: 'right',
        template: countCell
    },
    {
        displayProperty: 'Dynamics',
        width: '1fr',
        align: 'right',
        template: percentCell
    },
    {
        displayProperty: 'DateBegin',
        width: '1fr',
        align: 'right',
        fontSize: 'm'
    },
    {
        displayProperty: 'DateEnd',
        width: '1fr',
        align: 'right',
        fontSize: 'm'
    },
    {
        displayProperty: 'LeftDate',
        width: 'max-content',
        align: 'right',
        fontSize: 'm'
    }
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

interface IClientsOptions extends IControlOptions {
    _dataOptionsValue: IContextValue;
}

class Clients extends Control {
    protected _template: TemplateFunction = Template;

    protected _record: Record<IComponent>;

    protected _infoBlockOptions = INFO_BLOCK_OPTIONS;

    protected _periodsTotal: IPeriods;
    protected _totalClientsItems: RecordSet;
    protected _chartOptionsTotalClients = CHART_OPTIONS_TOTAL_CLIENTS;

    protected _topClientsItems: RecordSet;
    protected _chartOptionsTopClients = CHART_OPTIONS_TOP_CLIENTS;

    protected _exportItems: RecordSet = EXPORT_ITEMS;

    protected _header: IHeaderCell[] = HEADER_CELLS;
    protected _columns: IColumn[] = COLUMNS;
    protected _itemPadding: object = ITEM_PADDING;
    protected _tableItems: RecordSet;
    protected _periodsTable: IPeriods;

    protected _beforeMount(options: IClientsOptions): void {
        this._reloadItems = this._reloadItems.bind(this);
        this._record = options.record;

        this._updateTotalClientsItems(options);
        this._updateTopClientsItems(options);
        this._updateTableItems(options);
    }

    protected _beforeUpdate(options: IClientsOptions): void {
        if (!options.record?.isEqual(this._record)) {
            this._record = options.record;
        }

        const totalClientsItems = options._dataOptionsValue.clientsTotal.items.at(0);
        const topClientsItems = options._dataOptionsValue.clientsTop.items;
        const tableItems = options._dataOptionsValue.clientsTable.items;

        if (!totalClientsItems?.isEqual(this._totalClientsItems)) {
            this._updateTotalClientsItems(options);
        }

        if (!topClientsItems?.isEqual(this._topClientsItems)) {
            this._updateTopClientsItems(options);
        }

        if (!tableItems?.isEqual(this._tableItems)) {
            this._updateTableItems(options);
        }

    }

    private _updateTotalClientsItems(options: IClientsOptions): void {
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

    private _updateTopClientsItems(options: IClientsOptions): void {
        const filter = options._dataOptionsValue.clientsTop.filter;
        this._topClientsItems = options._dataOptionsValue.clientsTop.items.clone();

        const items = factory(this._topClientsItems)
            .filter(record => record.get('Clicks2') || record.get('Clicks1'))
            .first(5)
            .value();

        const categories = items.length ? items.map(record => record.get('Name')) : this._chartOptions.xAxis.categories;
        const emptyArray = [...new Array(categories.length)].fill(0);
        const series = [{
            color: '#434348',
            name: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType),
            data: items.length ? items.map(record => record.get('Clicks1')) : emptyArray
        }, {
            color: '#5C94FB',
            name: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType),
            data: items.length ? items.map(record => record.get('Clicks2')) : emptyArray
        }];


        this._chartOptionsTopClients = {
            ...this._chartOptionsTopClients,
            xAxis: {...this._chartOptionsTopClients.xAxis, categories},
            series
        }
    }

    private _updateTableItems(options: IClientsOptions): void {
        this._tableItems = options._dataOptionsValue.clientsTable.items.clone();

        this._setPeriodsTable(options._dataOptionsValue.clientsTable.filter);
    }

    private _setPeriodsTotal(filter: IPeriods): void {
        this._periodsTotal = getPeriodsForControl(filter);
    }

    private _setPeriodsTable(filter: IPeriods): void {
        this._periodsTable = getPeriodsForControl(filter);

        this._header = this._header.map((cell, index) => {
            if (index === 2) {
                return {...cell, caption: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType)};
            } else if (index === 3) {
                return {...cell, caption: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType)};
            }

            return cell;
        })
    }

    protected _periodsChangedTable(e: SyntheticEvent, periods: IPeriods): void {
        const clientsTable = this._options._dataOptionsValue.clientsTable;

        const dates = getPeriodsForFilter(periods);

        clientsTable.setFilter({
            ...clientsTable.filter,
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
        const source = this._options._dataOptionsValue.clientsTable.source;
        const filter = this._options._dataOptionsValue.clientsTable.filter;
        const firstDate = getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType);
        const secondDate = getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType);

        const providerName = item.getKey() == '1' ? undefined : 'Export/PDFProvider';

        const exportController = new ExportController({
            providerName,
            columns: [
                {
                    field: 'AccountInfo/Name',
                    title: 'Организация'
                },
                {
                    field: 'AccountInfo/RegionName',
                    title: 'Регион'
                },
                {
                    field: 'Clicks1',
                    title: `за ${firstDate}`
                },
                {
                    field: 'Clicks2',
                    title: `за ${secondDate}`,
                },
                {
                    field: 'Dynamics',
                    title: 'Δ %'
                },
                {
                    field: 'License/DateBegin',
                    title: 'Куплена'
                },
                {
                    field: 'License/DateEnd',
                    title: 'Заканчивается'
                },
                {
                    field: 'License/text_left_full',
                    title: 'Осталось'
                },
                {
                    field: 'AccountId',
                    title: 'ID'
                },
            ],
            source,
            filter,
            fileName: `Активность организаций за ${firstDate}-${secondDate}`
        });
        exportController.execute();
    }

    protected _reloadItems(): void {
        return this._options._dataOptionsValue?.clientsTable.reload();
    }
}

export default connectToDataContext(Clients);