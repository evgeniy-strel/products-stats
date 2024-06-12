import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { getSource}  from '../sources';
import { IListLoadResult, IListDataFactoryArguments, IListState, List, ListSlice } from 'Controls/dataFactory';
import { Record } from 'Types/entity';
import { getStableAppUUID } from 'CommonAppMarket/helpers';
import { getCurrentMonthDate, getLastMonthDate, getStateInFilter } from '../helpers';
import { ComponentStatsUserModel } from '../models';
import { RecordSet } from 'Types/collection';
import { Direction } from 'Controls/interface';

export class ClientsSlice extends ListSlice {
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

export const ClientsFactory = {
    loadData: List.loadData,
    slice: ClientsSlice
};

export interface IClientsLoaderParams {
    /**
     * Рекорд компонента
     */
    record: Record<IComponent>
}

export default {
    getConfig(params: IClientsLoaderParams): object {
        const clientsTotal = {
            dataFactoryName: 'ComponentStats/statsSelector:ClientsFactory',
            dataFactoryArguments: {
                source: getSource('GetGraphList', 'ComponentArea'),
                filter: getFilterTotal(params),
                root: getStableAppUUID(params.record)
            },
            afterLoadCallback: 'ComponentStats/statsSelector:clientsAfterLoadCallback'
        };

        const clientsTop = {
            dataFactoryName: 'ComponentStats/statsSelector:ClientsFactory',
            dataFactoryArguments: {
                source: getSource('ActivityList', 'ComponentStatsUser', false, ComponentStatsUserModel),
                filter: getFilterTable(params),
                root: getStableAppUUID(params.record)
            },
        };

        const clientsTable = {
            dataFactoryName: 'ComponentStats/statsSelector:ClientsFactory',
            dataFactoryArguments: {
                source: getSource('ActivityList', 'ComponentStatsUser', false, ComponentStatsUserModel),
                filter: getFilterTable(params),
                keyProperty: 'AccountId',
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

        return {clientsTotal, clientsTop, clientsTable};
    }
};

export function getFilterTable(params: IClientsLoaderParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month",
    }
}

export function getFilterTotal(params: IClientsLoaderParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ForActivity: true,
        ByAccount: true,
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month",
    }
}

export function clientsAfterLoadCallback(loadResult: RecordSet | IListLoadResult) {
    const items = loadResult instanceof RecordSet ? loadResult : loadResult.items;
    const total = items.at(0).get('Data').summaryData.total;
    const max = Math.max(total.first, total.second);
    total.zero = Math.round(max * 1.11);
}