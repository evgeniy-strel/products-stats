import * as Template from 'wml!ComponentStats/_statsSelector/screens/GeneralSummary/GeneralSummary';
import * as titleWidthLegendTemplate from 'wml!ComponentStats/_statsSelector/columns/titleWithLegend';

import countCell from '../columns/countCell';
import { convertDate } from '../helpers';

import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { IColumn, IHeaderCell } from 'Controls/grid';
import { IPeriods } from 'Graphs/baseChart';
import { legend } from 'Graphs/DonutChartWithTable';
import { connectToDataContext, IContextValue } from 'Controls/context';
import { calculateFormattedNumber } from 'Controls/_baseDecorator/resources/Number';
import { SyntheticEvent } from 'UICommon/Events';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { Record } from 'Types/entity';
import { SWITCH_GRAPH_ITEMS } from '../consts';

const TARIFFS_HEADER_CELLS = [];

const TARIFFS_COLUMNS = [
    {
        displayProperty: 'name',
        width: 'max-content'
    },
    {
        displayProperty: 'value',
        width: '1fr',
        template: countCell,
        align: 'right'
    }
];

const TARIFFS_ITEMS = new RecordSet({
    keyProperty: 'id',
    rawData: [
        {
            id: 0,
            name: 'Базовый',
            value: null,
            // colorIndex: 12
        },
        {
            id: 1,
            name: 'Комфорт',
            value: null,
            // colorIndex: 11
        },
        {
            id: 2,
            name: 'Профи',
            value: null,
            // colorIndex: 10
        },
        {
            id: 3,
            name: 'Корпоративный',
            value: null,
            colorIndex: 5
        }
    ]
});

const TYPES_OPF = ['ООО', 'ИП', 'ОАО', 'АО'];

const OPF_DATA = [
    {
        id: 0,
        name: 'ООО',
        value: null,
        colorIndex: 1,
    },
    {
        id: 1,
        name: 'ИП',
        value: null,
        colorIndex: 2,
    },
    {
        id: 2,
        name: 'ОАО',
        value: null,
        colorIndex: 3,
    },
    {
        id: 3,
        name: 'АО',
        value: null,
        colorIndex: 5,
    }
];

const OPF_ITEMS = new RecordSet({
    keyProperty: 'id',
    rawData: [
        {
            id: 0,
            name: 'ООО',
            value: null,
            colorIndex: 1,
            legend
        },
        {
            id: 1,
            name: 'ИП',
            value: null,
            colorIndex: 2,
            legend
        },
        {
            id: 2,
            name: 'ОАО',
            value: null,
            colorIndex: 3,
            legend
        },
        {
            id: 3,
            name: 'АО',
            value: null,
            colorIndex: 5,
            legend
        }
    ]
});

const OPF_COLUMNS = [
    {
        displayProperty: 'name',
        width: '100px',
        template: titleWidthLegendTemplate
    },
    {
        displayProperty: 'value',
        width: '1fr',
        template: countCell
    }
];

const DEFAULT_SWITCH_GRAPH_KEY = SWITCH_GRAPH_ITEMS.at(0).getKey();

interface IGeneralOptions extends IControlOptions {
    _dataOptionsValue: IContextValue;
}

class GeneralSummary extends Control {
    protected _template: TemplateFunction = Template;

    protected _record: Record<IComponent>;
    protected _isLoading: object = {
        resultsUsage: true
    }

    protected _usersCount: number;
    protected _usersCountFormatted: string;
    protected _usersCountCaption: string;

    protected _tariffsItems: RecordSet = TARIFFS_ITEMS;
    protected _tariffsColumns: IColumn[] = TARIFFS_COLUMNS;
    protected _tariffsHeader: IHeaderCell[] = TARIFFS_HEADER_CELLS;

    protected _opfData: object[] = OPF_DATA;
    protected _opfItems: RecordSet = OPF_ITEMS;
    protected _opfColumns: IColumn[] = OPF_COLUMNS;

    protected _switchGraphItems: RecordSet = SWITCH_GRAPH_ITEMS;
    protected _switchGraphKey: number = DEFAULT_SWITCH_GRAPH_KEY;

    protected _graphData: RecordSet;
    protected _firstPeriodData: number[][];
    protected _secondPeriodData: number[][];
    protected _holidaysData: Boolean[] = [];
    protected _periods: IPeriods;
    protected _summaryData: object;

    protected _resultsItems: RecordSet;
    protected _resultsItem: Record;

    protected _beforeMount(options: IGeneralOptions): void {
        this._getTariffsItems = this._getTariffsItems.bind(this);
        this._getOpfItems = this._getOpfItems.bind(this);

        this._record = options.record;
        this._setUsersCount(options);
        this._tariffsItems = this._getTariffsItems();
        this._opfItems = this._getOpfItems(options);
        this._opfData = OPF_DATA.map((item, index) => ({...item, value: this._opfItems.getRecordById(index).get('value')}));

        this._updateGraphData(options);
        this._updateResultsUsage(options);
    }

    protected _beforeUpdate(options: IGeneralOptions): void {
        const graphData = options._dataOptionsValue.graphUsage.items.at(0);
        const resultsItems = options._dataOptionsValue.resultsUsage.items;

        if (!graphData?.isEqual(this._graphData)) {
            this._updateGraphData(options);
        }
        if (!resultsItems?.isEqual(this._resultsItems)) {
            this._updateResultsUsage(options);
        }
    }

    private _updateGraphData(options: IGeneralOptions): void {
        const items = options._dataOptionsValue.graphUsage.items.at(0);
        const data = items.get('Data');

        if (!this._switchGraphKey) {
            const summaryData = data['summaryData'];
            this._resultsItem = new Record({
                rawData: {
                    Count1: summaryData.total.first,
                    Count2: summaryData.total.second,
                    Dynamics: Math.round(((summaryData.total.second - summaryData.total.first) / summaryData.total.first) * 100).toFixed(1),
                    CountIn: Math.round(this._resultsItem.get('CountIn') * (summaryData.total.second / this._resultsItem.get('Count2'))),
                    CountOut: Math.round(this._resultsItem.get('CountOut') * (summaryData.total.second / this._resultsItem.get('Count2')))
                }
            })
            this._resultsItems = new RecordSet({});
            this._resultsItems.add(this._resultsItem);
        }

        this._graphData = items;
        this._firstPeriodData = data['firstPeriodData'];
        this._secondPeriodData = data['secondPeriodData'];
        this._holidaysData = data['holidaysData'];
        this._summaryData = data['summaryData'];

        this._setPeriods(options._dataOptionsValue.graphUsage.filter);
    }

    private _setPeriods(filter: IPeriods): void {
        this._periods = {
            selectedPeriodType: filter.selectedPeriodType,
            firstPeriodStart: new Date(filter.firstPeriodStart),
            secondPeriodStart: new Date(filter.secondPeriodStart),
            firstPeriodEnd: new Date(filter.firstPeriodEnd),
            secondPeriodEnd: new Date(filter.secondPeriodEnd)
        };
    }

    private _updateResultsUsage(options: IGeneralOptions): void {
        if (this._switchGraphKey) {
            this._resultsItems = options._dataOptionsValue.resultsUsage.items.clone();
            this._resultsItem = this._resultsItems.getMetaData().results;
        }
        this._isLoading.resultsUsage = false;
    }

    protected _periodsChanged(e: SyntheticEvent, periods: IPeriods): void {
        const graphUsage = this._options._dataOptionsValue.graphUsage;
        const resultsUsage = this._options._dataOptionsValue.resultsUsage;

        const dates = {
            firstPeriodStart: convertDate(periods.firstPeriodStart),
            firstPeriodEnd: convertDate(periods.firstPeriodEnd),
            secondPeriodStart: convertDate(periods.secondPeriodStart),
            secondPeriodEnd: convertDate(periods.secondPeriodEnd),
            selectedPeriodType: periods.selectedPeriodType
        };

        graphUsage.setFilter({
            ...graphUsage.filter,
            ...dates
        });
        resultsUsage.setFilter({
            ...resultsUsage.filter,
            ...dates
        });
    }

    protected _switchGraphKeyChanged(e: SyntheticEvent, key: number): void {
        const graphUsage = this._options._dataOptionsValue.graphUsage;
        const resultsUsage = this._options._dataOptionsValue.resultsUsage;
        const joinStats = key ? 'Account' : 'User';

        this._switchGraphKey = key;
        resultsUsage.setFilter({
            ...resultsUsage.filter,
            ByAccount: key,
            JoinStats: joinStats,
            JoinStatsFake: joinStats
        });
        graphUsage.setFilter({
            ...graphUsage.filter,
            ByAccount: key,
        });
    }

    private _setUsersCount(options: IGeneralOptions): void {
        this._usersCount = options._dataOptionsValue.usersByTariff.items.at(0).get('Data').summaryData.total.zero;
        const countString = calculateFormattedNumber(this._usersCount, true, 'trunc', 1, 'long', false, {value: this._usersCount, precision: 2});
        this._usersCountFormatted = countString.split(' ')[0];
        this._usersCountCaption = countString.split(' ')[1];
    }

    private _getTariffsItems(): RecordSet {
        let sum = 0;
        const ratio = [23,19,30,28];
        TARIFFS_ITEMS.each((item, index) => {
            if (TARIFFS_ITEMS.getCount() - 1 !== index) {
                const value = Math.round(this._usersCount * ratio[index] / 100);
                item.set('value', value);
                sum += value;
            } else {
                item.set('value', this._usersCount - sum)
            }
        })
        return TARIFFS_ITEMS;
    }

    private _getOpfItems(options: IGeneralOptions): RecordSet {
        const countByType = {};
        TYPES_OPF.forEach((type) => countByType[type] = 0);
        const users = options._dataOptionsValue.usersOpf.items;
        const countUsers = users.getCount();

        users.each((user, index) => {
            const name = user.get('AccountInfo')?.get('Name') || "";
            const typeOpf = TYPES_OPF.find(type => name.includes(type)) || 'ООО';
            countByType[typeOpf] += 1;
        })

        const ratio = {};
        for (let type in countByType) {
            ratio[type] = countByType[type] / countUsers;
        }

        let sum = 0;
        OPF_ITEMS.each((item, index) => {
            const value = Math.round(this._usersCount * ratio[item.get('name')]);
            item.set('value', value);
            if (item.get('name') !== 'ООО') sum += value;
        })
        OPF_ITEMS.getRecordById(0).set('value', this._usersCount - sum);

        return OPF_ITEMS;
    }
}

export default connectToDataContext(GeneralSummary);