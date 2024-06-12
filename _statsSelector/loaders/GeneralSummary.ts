import { ACCORDION_ITEM_UUID, ComponentState, EEntityMode, PAGES_OBJECT_UUID } from 'CommonAppMarket/utils/consts';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { getSource}  from '../sources';
import { IListLoadResult, IListDataFactoryArguments, IListState, List, ListSlice } from 'Controls/dataFactory';
import { Direction } from 'Controls/interface';
import { factory } from 'Types/chain';
import { RecordSet } from 'Types/collection';
import { Record } from 'Types/entity';
import { SbisService } from 'Types/source';
import { getStableAppUUID, isNotPublishedNever } from 'CommonAppMarket/helpers';
import { getCurrentMonthDate, getLastMonthDate, getStateInFilter } from '../helpers';

export class GeneralSummarySlice extends ListSlice {
    protected _initState(loadResult: IListLoadResult, dataFactoryParams: IListDataFactoryArguments): IListState {
        dataFactoryParams.afterLoadCallback?.(loadResult);
        return super._initState(loadResult, dataFactoryParams);
    }

    protected _beforeApplyState(nextState: IListState): IListState | Promise<IListState> {
        return super._beforeApplyState(nextState);
    }

    protected _dataLoaded(items: RecordSet, direction: Direction, nextState: IListState): IListState {
        return nextState;
    }
}

export const GeneralSummaryFactory = {
    loadData: List.loadData,
    slice: GeneralSummarySlice
};

export interface IGeneralSummaryLoaderParams {
    /**
     * Рекорд компонента
     */
    record: Record<IComponent>
}

export default {
    getConfig(params: IGeneralSummaryLoaderParams): object {
        const usersByTariff = {
            dataFactoryName: 'ComponentStats/statsSelector:GeneralSummaryFactory',
            dataFactoryArguments: {
                source: getSource('GetGraphList', 'ComponentArea'),
                filter: getFilterTariff(params),
                root: getStableAppUUID(params.record),
                afterLoadCallback: (loadResult) => {
                    const total = loadResult.data.at(0).get('Data').summaryData.total;
                    const max = Math.max(total.first, total.second);
                    total.zero = Math.round(max * 1.11);
                }
            }
        };

        const usersOpf = {
            dataFactoryName: 'ComponentStats/statsSelector:GeneralSummaryFactory',
            dataFactoryArguments: {
                source: getSource('ActivityList', 'ComponentStatsUser'),
                filter: getFilterOpf(params),
                root: getStableAppUUID(params.record),
                navigation: {
                    source: 'page',
                    view: 'infinity',
                    sourceConfig: {
                        pageSize: 300,
                        page: 0
                    }
                }
            }
        };

        const graphUsage = {
            dataFactoryName: 'ComponentStats/statsSelector:GeneralSummaryFactory',
            dataFactoryArguments: {
                source: getSource('GetGraphList', 'ComponentArea'),
                filter: getFilterGraphUsage(params),
                root: getStableAppUUID(params.record),
            }
        };

        const resultsUsage = {
            dataFactoryName: 'ComponentStats/statsSelector:GeneralSummaryFactory',
            dataFactoryArguments: {
                source: getSource('GetData', 'ComponentStatsReport'),
                filter: getFilterResultsUsage(params),
                root: getStableAppUUID(params.record),
            }
        };

        return {usersByTariff, usersOpf, graphUsage, resultsUsage};
    }
};

export function getFilterTariff(params: IGeneralSummaryLoaderParams): object {
    const {start: secondPeriodStart, end: secondPeriodEnd} = getLastMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        ForActivity: true,
        JoinStatsFake: "Account",
        firstPeriodStart: "2024-03-01",
        firstPeriodEnd: "2024-03-31",
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}

export function getFilterOpf(params: IGeneralSummaryLoaderParams): object {
    const {start: secondPeriodStart, end: secondPeriodEnd} = getLastMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        firstPeriodStart: "2024-03-01",
        firstPeriodEnd: "2024-03-31",
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}

export function getFilterGraphUsage(params: IGeneralSummaryLoaderParams): object {
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

export function getFilterResultsUsage(params: IGeneralSummaryLoaderParams): object {
    const {start: firstPeriodStart, end: firstPeriodEnd} = getLastMonthDate();
    const {start: secondPeriodStart, end: secondPeriodEnd} = getCurrentMonthDate();

    return {
        AccountId: null,
        AreaComponentId: getStableAppUUID(params.record),
        ByAccount: true,
        ByActivity: true,
        ShowResponsible: true,
        firstPeriodStart,
        firstPeriodEnd,
        secondPeriodStart,
        secondPeriodEnd,
        selectedPeriodType: "month"
    }
}