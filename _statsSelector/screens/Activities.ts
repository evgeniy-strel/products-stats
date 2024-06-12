import * as Template from 'wml!ComponentStats/_statsSelector/screens/Activities/Activities';

import countCell from '../columns/countCell';
import titleWithDescription from '../columns/titleWithDescription';
import percentCell from '../columns/percentCell';
import { convertDate, getPeriodsForControl, getPeriodsForFilter, getShortDateFormat } from '../helpers';

import { InfoBlockAlign } from 'Graphs/InfoBlock';

import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { IColumn, IHeaderCell } from 'Controls/grid';
import { IPeriods } from 'Graphs/baseChart';
import {connectToDataContext, IContextValue} from 'Controls/context';
import { SyntheticEvent } from 'UICommon/Events';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { Model, Record } from 'Types/entity';
import { DEFAULT_BLOCK_RESULT_ITEM, INFO_BLOCK_OPTIONS, ITEM_PADDING, SWITCH_GRAPH_ITEMS } from '../consts';
import { showType } from 'Controls/toolbars';
import { IBlockResultItem } from '../interfaces';
import { getStableAppUUID } from 'CommonAppMarket/helpers';
import { DialogOpener, StackOpener } from 'Controls/popup';
import { ESignificanceLevel } from 'CommonAppMarket/utils/consts';
import { CrudEntityKey, SbisService } from 'Types/source';
import { IItemAction, TItemActionShowType } from 'Controls/itemActions';
import { activitiesSource } from '../sources';
import { IDragObject, ItemsEntity } from 'Controls/dragnDrop';

const HEADER_CELLS: IHeaderCell[] = [
    {
        caption: 'Название действия',
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

const RESULTS_ITEM = {
    Block1: {
        ...DEFAULT_BLOCK_RESULT_ITEM,
        Title: 'Всего действий'
    },
    Block2: {
        ...DEFAULT_BLOCK_RESULT_ITEM,
        Title: 'Всего организаций'
    },
    Block3: {
        ...DEFAULT_BLOCK_RESULT_ITEM,
        Title: 'Действий на организацию'
    }
};

const ITEM_ACTIONS: IItemAction[] = [
    {
        id: 'Edit',
        icon: 'icon-Edit',
        showType: TItemActionShowType.MENU,
        iconStyle: 'secondary',
        title: 'Редактировать'
    },
    {
        id: 'AddActivity',
        icon: 'icon-AddButtonNew',
        showType: TItemActionShowType.MENU,
        iconStyle: 'secondary',
        title: 'Записать действие'
    },
    {
        id: 'AddActivityFolder',
        icon: 'icon-CreateFolder',
        showType: TItemActionShowType.MENU,
        iconStyle: 'secondary',
        title: 'Создать папку'
    },
    {
        id: 'Remove',
        icon: 'icon-Erase',
        showType: TItemActionShowType.MENU,
        iconStyle: 'danger',
        title: 'Удалить'
    }
];

const DEFAULT_SWITCH_GRAPH_KEY = SWITCH_GRAPH_ITEMS.at(0).getKey();

interface IActivitiesOptions extends IControlOptions {
    _dataOptionsValue: IContextValue;
}

class Activities extends Control {
    protected _template: TemplateFunction = Template;

    protected _record: Record<IComponent>;
    protected _isReadOnly: boolean;

    protected _infoBlockOptions = INFO_BLOCK_OPTIONS;

    protected _resultsItem: object = RESULTS_ITEM;

    protected _switchGraphItems: RecordSet = SWITCH_GRAPH_ITEMS;
    protected _switchGraphKey: number = DEFAULT_SWITCH_GRAPH_KEY;

    protected _graphData: RecordSet;
    protected _firstPeriodData: number[][];
    protected _secondPeriodData: number[][];
    protected _holidaysData: Boolean[] = [];
    protected _periods: IPeriods;
    protected _summaryData: object;
    protected _infoBlockAlignConfig: object = INFO_BLOCK_ALIGN_CONFIG;
    protected _isTableLoading: boolean = true;

    protected _header: IHeaderCell[] = HEADER_CELLS;
    protected _columns: IColumn[] = COLUMNS;
    protected _itemPadding: object = ITEM_PADDING;
    protected _itemActions: IItemAction[] = ITEM_ACTIONS;
    protected _tableItems: RecordSet;

    private _source: SbisService = activitiesSource;
    private _stackOpener: StackOpener;
    private _folderOpener: DialogOpener;
    private _createMetaData: object = { SignificanceLevel: ESignificanceLevel.additional };

    protected _beforeMount(options: IActivitiesOptions): void {
        this._reloadItems = this._reloadItems.bind(this);
        this._record = options.record;
        this._isReadOnly = options.role !== 'moderator' && options.role !== 'activityConfig';

        this._updateGraphData(options);
        this._updateTableItems(options);
    }

    protected _beforeUpdate(options: IActivitiesOptions): void {
        if (!options.record?.isEqual(this._record)) {
            this._record = options.record;
        }

        const graphData = options._dataOptionsValue.activitiesGraph.items.at(0);
        const tableItems = options._dataOptionsValue.activitiesTable.items;

        if (!graphData?.isEqual(this._graphData)) {
            this._updateGraphData(options);
        }

        if (!tableItems?.isEqual(this._tableItems)) {
            this._updateTableItems(options);
        }

    }

    private _updateGraphData(options: IActivitiesOptions): void {
        const items = options._dataOptionsValue.activitiesGraph.items.at(0);
        const data = items.get('Data');

        this._graphData = items;
        this._firstPeriodData = data['firstPeriodData'];
        this._secondPeriodData = data['secondPeriodData'];
        this._holidaysData = data['holidaysData'];
        this._summaryData = data['summaryData'];

        this._setPeriods(options._dataOptionsValue.activitiesGraph.filter);
        this._resultsItem = {...this._resultsItem, Block2: this._getSumUsers(data)}
        if (this._isGraphAndTableDataLoaded()) {
            this._resultsItem = {...this._resultsItem, Block3: this._getActivitiesOnUser()};
        }
    }

    private _updateTableItems(options: IActivitiesOptions): void {
        this._tableItems = options._dataOptionsValue.activitiesTable.items.clone();
        this._isTableLoading = false;
        this._resultsItem = {...this._resultsItem, Block1: this._getSumActivities(this._tableItems)};
        if (this._isGraphAndTableDataLoaded()) {
            this._resultsItem = {...this._resultsItem, Block3: this._getActivitiesOnUser()};
        }
    }

    private _setPeriods(filter: IPeriods): void {
        this._periods = getPeriodsForControl(filter);

        this._header = this._header.map((cell, index) => {
            if (HEADER_CELL_FIRST_PERIOD.includes(index)) {
                return {...cell, caption: getShortDateFormat(new Date(filter.firstPeriodStart), filter.selectedPeriodType)};
            } else if (HEADER_CELL_SECOND_PERIOD.includes(index)) {
                return {...cell, caption: getShortDateFormat(new Date(filter.secondPeriodStart), filter.selectedPeriodType)};
            }

            return cell;
        });
    }

    protected _periodsChanged(e: SyntheticEvent, periods: IPeriods): void {
        const activitiesGraph = this._options._dataOptionsValue.activitiesGraph;
        const activitiesTable = this._options._dataOptionsValue.activitiesTable;

        this._isTableLoading = true;

        const dates = getPeriodsForFilter(periods);

        activitiesGraph.setFilter({
            ...activitiesGraph.filter,
            ...dates
        });
        activitiesTable.setFilter({
            ...activitiesTable.filter,
            ...dates
        });
    }

    protected _switchGraphKeyChanged(e: SyntheticEvent, key: number): void {
        const activitiesGraph = this._options._dataOptionsValue.activitiesGraph;
        const activitiesTable = this._options._dataOptionsValue.activitiesTable;
        const joinStats = key ? 'Account' : 'User';

        if (key) {
            this._header = this._header.map(cell => ({...cell, caption: cell.caption.replace('Пользователи', 'Организации')}));
            this._resultsItem.Block2.Title = 'Всего организаций';
            this._resultsItem.Block3.Title = 'Действий на организацию';
        } else {
            this._header = this._header.map(cell => ({...cell, caption: cell.caption.replace('Организации', 'Пользователи')}));
            this._resultsItem.Block2.Title = 'Всего пользователей';
            this._resultsItem.Block3.Title = 'Действий на пользователя';
        }

        this._switchGraphKey = key;
        activitiesTable.setFilter({
            ...activitiesTable.filter,
            ByAccount: key,
            JoinStats: joinStats,
            JoinStatsFake: joinStats
        });
        activitiesGraph.setFilter({
            ...activitiesGraph.filter,
            JoinStatsFake: joinStats,
            ByAccount: key,
        });
    }

    protected _itemActionVisibilityCallback(action: IItemAction, item: Model): boolean {
        switch (action.id) {
            case 'Edit':
            case 'Remove':
                return true;
            case 'AddActivity':
            case 'AddActivityFolder':
                return item.get('Parent@') !== null;
        }
    }

    protected _actionClick(event: Event, action: IItemAction, item: Model) {
       switch (action.id) {
            case 'Remove':
                this._deleteItem(item);
                break;
            case 'Edit':
                this._editActivity(item);
                break;
            case 'AddActivity':
                this._openStackHandler(item);
                break;
            case 'AddActivityFolder':
                this._editFolder(item);
                break;
        }
    }

    protected _openStackHandler(item?: Model): void {
        const selectorOptions = {
            ComponentUUID: getStableAppUUID(this._record),
            width: 600,
            createMetaData: {
                ...this._createMetaData,
                ComponentUUID: getStableAppUUID(this._record),
                Parent: item instanceof Record ? item.get('@Activity') : null
            }
        };

        if (!this._stackOpener) {
            this._stackOpener = new StackOpener();
        }

        this._stackOpener.open({
            opener: this,
            template: 'ComponentStats/statsSelector:ScenarioSelector',
            templateOptions: selectorOptions,
            width: 600,
            eventHandlers: {
                onResult: ({item}) => {
                    if (item) {
                        this._reloadItems();
                    }
                },
                onClose: () => {
                    this._reloadItems();
                }
            }
        });
    }

    protected _editFolder(item?: Record, isEditing?: boolean): void {
        if (!this._folderOpener || !item) {
            this._folderOpener?.close();
            this._folderOpener = new DialogOpener();
        }

        this._folderOpener.open({
            opener: this,
            width: 450,
            maxWidth: 450,
            closeOnOutsideClick: false,
            template: 'CommonAppMarket/_editComponents/CommonTree/EditFolder',
            templateOptions: {
                source: this._source,
                record: isEditing && item instanceof Record ? item : undefined,
                createMetaData: {
                    ComponentUUID: getStableAppUUID(this._record),
                    Parent: item instanceof Record ? item.get('@Activity') : null
                },
                showSignificanceLevel: false
            },
            eventHandlers: {
                onResult: (res) => {
                    if (res.formControllerEvent === 'update') {
                        this._reloadItems();
                    }
                }
            }
        });
    }

    private _deleteItem(item: Model): void {
        activitiesSource.call('Delete', {ИдО: [item.get('@Activity')]}).then(this._reloadItems);
    }

    private _editActivity(item: Model): void {
        activitiesSource.read(item.get('@Activity')).then((activity: Model) => {
            if (item.get('Parent@') !== null) {
                this._editFolder(activity, true);
            } else {
                new StackOpener().open({
                    opener: this,
                    template: 'ComponentStats/statsSelector:ScenarioSelector',
                    width: 600,
                    templateOptions: {record: activity, readOnly: false},
                    eventHandlers: {
                        onResult: ({needReload}) => {
                            if (needReload) {
                                this._reloadItems();
                            }
                        }
                    }
                });
            }
        });
    }

    protected _dragStart(_: Event, draggedItems: CrudEntityKey[], draggedKey: CrudEntityKey): ItemsEntity | boolean {
        if (!this._isGraphAndTableDataLoaded()) {
            return false;
        }

        return new ItemsEntity({
            items: [draggedKey],
        });
    }

    protected _dragEnd(_: Event, itemsEntity: ItemsEntity, target: Model, position: 'after'|'before'|'on'): Promise<void> {
        const dragged = this._tableItems.getRecordById(itemsEntity.getItems()[0]);

        return new SbisService({
            endpoint: {
                address: '/cmarket/service/',
                contract: 'Activity'
            }
        }).call('Move', {
            Object: dragged,
            Destination: target,
            Position: position
        }).then(this._reloadItems);
    }

    private _getSumActivities(items: RecordSet): IBlockResultItem {
        const sumViews = {...DEFAULT_BLOCK_RESULT_ITEM, Title: this._resultsItem.Block1.Title};
        items.each(item => {
            if (item.get('Parent') === getStableAppUUID(this._record)) {
                sumViews.Value1 += item.get('StatsClicks1');
                sumViews.Value2 += item.get('StatsClicks2');
            }
        })

        sumViews.Percent = Number(((sumViews.Value2 - sumViews.Value1) / sumViews.Value1 * 100).toFixed(1));

        return sumViews;
    }

    protected _reloadItems(): void {
        return this._options._dataOptionsValue?.activitiesTable.reload();
    }

    private _getSumUsers(data: object): IBlockResultItem {
        const total = data.summaryData.total;

        return {
            Title: this._resultsItem.Block2.Title,
            Value1: total.first,
            Value2: total.second,
            Percent: Number(((total.second - total.first) / total.first * 100).toFixed(1))
        };
    }

    private _getActivitiesOnUser(): IBlockResultItem {
        const Value1 = Number(Math.round(this._resultsItem.Block1.Value1 / this._resultsItem.Block2.Value1).toFixed(1));
        const Value2 = Number(Math.round(this._resultsItem.Block1.Value2 / this._resultsItem.Block2.Value2).toFixed(1));

        return {
            Title: this._resultsItem.Block3.Title,
            Value1,
            Value2,
            Percent: Number(((Value2 - Value1) / Value1 * 100).toFixed(1))
        }
    }

    private _isGraphAndTableDataLoaded(): boolean {
        return !this._isTableLoading && !this._options._dataOptionsValue?.activitiesGraph.state.loading;
    }
}

export default connectToDataContext(Activities);