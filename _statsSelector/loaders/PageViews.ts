import { ACCORDION_ITEM_UUID, ComponentState, EEntityMode, PAGES_OBJECT_UUID } from 'CommonAppMarket/utils/consts';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { getSource}  from '../sources';
import { IListLoadResult, IListDataFactoryArguments, IListState, List, ListSlice } from 'Controls/dataFactory';
import { Direction } from 'Controls/interface';
import { factory } from 'Types/chain';
import { RecordSet } from 'Types/collection';
import { Record } from 'Types/entity';
import { getStableAppUUID } from 'CommonAppMarket/helpers';
import { getCurrentMonthDate, getLastMonthDate, getStateInFilter } from '../helpers';
import { CrudEntityKey } from 'Types/source';

export class PageViewsSlice extends ListSlice {
    protected _initState(loadResult: IListLoadResult, dataFactoryParams: IListDataFactoryArguments): IListState {
        if (dataFactoryParams.keyProperty === 'ID') {
            this._sortItems(loadResult.items)
        }
        return super._initState(loadResult, dataFactoryParams);
    }

    protected _beforeApplyState(nextState: IListState): IListState | Promise<IListState> {
        return super._beforeApplyState(nextState);
    }

    protected _dataLoaded(items: RecordSet, direction: Direction, nextState: IListState): IListState {
        if (nextState.keyProperty === 'ID') {
            this._sortItems(items);
        }
        return nextState;
    }

    protected _nodeDataLoaded(items: RecordSet, key: CrudEntityKey, direction: Direction, nextState: IListState): IListState {
        if (nextState.keyProperty === 'ID') {
            this._sortItems(items);
        }
        return nextState;
    }

    protected _sortItems(items: RecordSet) {
        const sortedItems = factory(items)
            .sort((firstRecord, secondRecord) => secondRecord.get('StatsClicks2') - firstRecord.get('StatsClicks2'))
            .value();
        items.clear();
        sortedItems.forEach(item => items.add(item))
    }
}

export const PageViewsFactory = {
    loadData: List.loadData,
    slice: PageViewsSlice
};

export interface IPageViewsParams {
    /**
     * Рекорд компонента
     */
    record: Record<IComponent>
}

export default {
    getConfig(params: IPageViewsParams): object {
        const pageChart = {
            dataFactoryName: 'ComponentStats/statsSelector:PageViewsFactory',
            dataFactoryArguments: {
                source: getSource('ListWithComponents', 'ComponentArea'),
                filter: getFilterPageTable(params),
                root: getStableAppUUID(params.record),
                keyProperty: 'ID',
                expandedItems: [null]
            }
        };

        const pageTable = {
            dataFactoryName: 'ComponentStats/statsSelector:PageViewsFactory',
            dataFactoryArguments: {
                source: getSource('ListWithComponents', 'ComponentArea'),
                filter: getFilterPageTable(params),
                root: getStableAppUUID(params.record),
                keyProperty: 'ID',
                displayProperty: 'Title',
                parentProperty: 'Parent',
                nodeProperty: 'Parent@',
                hasChildrenProperty: 'Parent@',
                expanderVisibility: 'hasChildren',
                navigation: {
                    source: 'page',
                    view: 'infinity',
                    sourceConfig: {
                        pageSize: 50,
                        page: 0
                    }
                },
            }
        };

        const pageGraph = {
            dataFactoryName: 'ComponentStats/statsSelector:PageViewsFactory',
            dataFactoryArguments: {
                source: getSource('GetGraphList', 'ComponentArea'),
                filter: getFilterPageGraph(params),
                root: getStableAppUUID(params.record),
            }
        };

        return {pageChart, pageTable, pageGraph};
    }
};

export function getFilterPageTable(params: IPageViewsParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        ActivityAndPages: null,
        AddMetadata: false,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: false,
        ClassUUIDList: [PAGES_OBJECT_UUID, ACCORDION_ITEM_UUID],
        DisplayUnassigned: true,
        HideDuplicates: true,
        HideEmptyNodes: false,
        JoinItems: true,
        JoinStats: "User",
        JoinStatsFake: "User",
        Mode: [0,1,2,3,4],
        State: getStateInFilter(params.record),
        Parent: getStableAppUUID(params.record),
        Type: 'page',
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}

export function getFilterPageGraph(params: IPageViewsParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: false,
        ForActivity: false,
        JoinStatsFake: 'User',
        PageId: "",
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}