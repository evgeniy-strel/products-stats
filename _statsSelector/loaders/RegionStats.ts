import { ACCORDION_ITEM_UUID, PAGES_OBJECT_UUID } from 'CommonAppMarket/utils/consts';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { getSource}  from '../sources';
import { IListLoadResult, IListDataFactoryArguments, IListState, List, ListSlice } from 'Controls/dataFactory';
import { Direction } from 'Controls/interface';
import { factory } from 'Types/chain';
import { RecordSet } from 'Types/collection';
import { Record } from 'Types/entity';
import { getStableAppUUID } from 'CommonAppMarket/helpers';
import { getCurrentMonthDate, getLastMonthDate, getStateInFilter } from '../helpers';

export class RegionStatsSlice extends ListSlice {
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

    protected _sortItems(items: RecordSet) {
        const sortedItems = factory(items)
            .sort((firstRecord, secondRecord) => secondRecord.get('StatsClicks2') - firstRecord.get('StatsClicks2'))
            .value();
        items.clear();
        sortedItems.forEach(item => items.add(item))
    }
}

export const RegionStatsFactory = {
    loadData: List.loadData,
    slice: RegionStatsSlice
};

export interface IRegionStatsParams {
    /**
     * Рекорд компонента
     */
    record: Record<IComponent>
}

export default {
    getConfig(params: IRegionStatsParams): object {
        const regionTable = {
            dataFactoryName: 'ComponentStats/statsSelector:RegionStatsFactory',
            dataFactoryArguments: {
                source: getSource('ListWithActivities', 'ComponentArea'),
                filter: getFilterTable(params),
                root: getStableAppUUID(params.record),
                keyProperty: 'ID',
                displayProperty: 'Name',
                navigation: {
                    source: 'page',
                    view: 'infinity',
                    sourceConfig: {
                        pageSize: 500,
                        page: 0
                    }
                },
            }
        };

        return {regionTable};
    }
};

export function getFilterTable(params: IRegionStatsParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        ActivityAndPages: false,
        AddMetadata: true,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        ClassUUIDList: [PAGES_OBJECT_UUID, ACCORDION_ITEM_UUID],
        ComponentParent: getStableAppUUID(params.record),
        DisplayUnassigned: true,
        HideDuplicates: true,
        HideEmptyNodes: false,
        JoinItems: true,
        JoinStatsFake: "User",
        Mode: [0,1,2,3,4],
        NodeType: 1,
        State: getStateInFilter(params.record),
        Parent: getStableAppUUID(params.record),
        Type: 'component',
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}