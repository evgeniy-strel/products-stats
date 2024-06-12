import { isNotPublishedNever } from 'CommonAppMarket/helpers';
import { ComponentState } from 'CommonAppMarket/utils/consts';
import { IComponent } from 'CommonAppMarket/utils/interfaces';
import { IPeriods, getFullYear, getMonthAndYear, getShortHalfYear, getShortQuarter } from 'Graphs/baseChart';
import { Record } from 'Types/entity';
import { date as formatter } from 'Types/formatter';

export function convertDate(date: Date): string {
    return formatter(date, 'YYYY-MM-DD');
}

/**
 * Для неопубликованного компонента нужны записи черновика
 * @param record Рекорд компонента
 */
export function getStateInFilter(record: Record<IComponent>): ComponentState[] | undefined {
    if (isNotPublishedNever(record)) {
        return [ComponentState.allStates];
    }

    return undefined;
}

export function getCurrentMonthDate() {
    const startDate = new Date();
    startDate.setDate(1);

    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1);
    endDate.setDate(0);

    return {start: convertDate(startDate), end: convertDate(endDate)};
}

export function getLastMonthDate() {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    endDate.setDate(0);

    return {start: convertDate(startDate), end: convertDate(endDate)};
}

export function getShortDateFormat(date: Date, period): string {
    let formattedDate = '';

    switch (period) {
        case 'year':
            formattedDate += getFullYear(date);
            break;
        case 'halfyear':
            formattedDate += getShortHalfYear(date);
            break;
        case 'quarter':
            formattedDate += getShortQuarter(date);
            break;
        default:
            formattedDate += getMonthAndYear(date);
            break;
    }

    return formattedDate;
}

export function getPeriodsForControl(filter: object): IPeriods {
    return {
        selectedPeriodType: filter.selectedPeriodType,
        firstPeriodStart: new Date(filter.firstPeriodStart),
        secondPeriodStart: new Date(filter.secondPeriodStart),
        firstPeriodEnd: new Date(filter.firstPeriodEnd),
        secondPeriodEnd: new Date(filter.secondPeriodEnd)
    };
}

export function getPeriodsForFilter(periods: IPeriods): object {
    return {
        firstPeriodStart: convertDate(periods.firstPeriodStart),
        firstPeriodEnd: convertDate(periods.firstPeriodEnd),
        secondPeriodStart: convertDate(periods.secondPeriodStart),
        secondPeriodEnd: convertDate(periods.secondPeriodEnd),
        selectedPeriodType: periods.selectedPeriodType
    };
}