import { ACCORDION_ITEM_UUID, ComponentState, EEntityMode, PAGES_OBJECT_UUID } from 'CommonAppMarket/utils/consts';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { getSource}  from '../sources';
import { IListLoadResult, IListDataFactoryArguments, IListState, List, ListSlice } from 'Controls/dataFactory';
import { Direction } from 'Controls/interface';
import { RecordSet } from 'Types/collection';
import { Record } from 'Types/entity';
import { getStableAppUUID } from 'CommonAppMarket/helpers';
import { getCurrentMonthDate, getLastMonthDate, getStateInFilter } from '../helpers';

export class ActivitiesSlice extends ListSlice {
    protected _initState(loadResult: IListLoadResult, dataFactoryParams: IListDataFactoryArguments): IListState {
        return super._initState(loadResult, dataFactoryParams);
    }

    protected _beforeApplyState(nextState: IListState): IListState | Promise<IListState> {
        return super._beforeApplyState(nextState);
    }

    protected _dataLoaded(items: RecordSet, direction: Direction, nextState: IListState): IListState {
        return nextState;
    }
}

export const ActivitiesFactory = {
    loadData: List.loadData,
    slice: ActivitiesSlice
};

export interface IActivitiesParams {
    /**
     * Рекорд компонента
     */
    record: Record<IComponent>
}

export default {
    getConfig(params: IActivitiesParams): object {
        const activitiesTable = {
            dataFactoryName: 'ComponentStats/statsSelector:ActivitiesFactory',
            dataFactoryArguments: {
                source: getSource('ListWithActivities', 'ComponentArea'),
                filter: getFilterPageTable(params),
                root: getStableAppUUID(params.record),
                keyProperty: 'ID',
                displayProperty: 'Title',
                parentProperty: 'Parent',
                nodeProperty: 'Parent@',
                hasChildrenProperty: 'Parent@',
                expanderVisibility: 'hasChildren',
                deepReload: true,
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

        const activitiesGraph = {
            dataFactoryName: 'ComponentStats/statsSelector:ActivitiesFactory',
            dataFactoryArguments: {
                source: getSource('GetGraphList', 'ComponentArea'),
                filter: getFilterPageGraph(params),
                root: getStableAppUUID(params.record),
            }
        };

        return {activitiesTable, activitiesGraph};
    }
};

export function getFilterPageTable(params: IActivitiesParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        ActivityAndPages: false,
        AddMetadata: false,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        ClassUUIDList: [PAGES_OBJECT_UUID, ACCORDION_ITEM_UUID],
        DisplayUnassigned: true,
        HideDuplicates: true,
        HideEmptyNodes: false,
        JoinItems: true,
        JoinStats: "Account",
        JoinStatsFake: "Account",
        Mode: [0,1,2,3,4],
        State: getStateInFilter(params.record),
        Parent: getStableAppUUID(params.record),
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}

export function getFilterPageGraph(params: IActivitiesParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        ForActivity: true,
        JoinStatsFake: 'Account',
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}