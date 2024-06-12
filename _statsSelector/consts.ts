import { RecordSet } from "Types/collection";
import { IBlockResultItem } from "./interfaces";

export const SWITCH_GRAPH_ITEMS = new RecordSet({
    keyProperty: 'id',
    rawData: [
        {
            id: true,
            title: 'По организациям',
            value: true,
        },
        {
            id: false,
            title: 'По пользователям',
            value: false,
        }
    ]
});

export const ITEM_PADDING = {
    bottom: null,
    left: null,
    right: 'm',
    top: null
}

export const INFO_BLOCK_OPTIONS = {
    currentDate: new Date(),
    summaryData: {
        current: {
            first: 0,
            second: 0,
        },
        total: {
            first: 0,
            second: 0,
        },
    }
}

export const DEFAULT_BLOCK_RESULT_ITEM: IBlockResultItem = {
    Title: '',
    Value1: 0,
    Value2: 0,
    Percent: 0
}

export const EXPORT_ITEMS = new RecordSet({
    keyProperty: 'key',
    rawData: [
        {
            key: '1',
            icon: 'icon-TFDocumentX',
            iconStyle: 'info',
            title: 'В Excel',
        },
        {
            key: '2',
            icon: 'icon-TFDocumentPDF',
            iconStyle: 'info',
            title: 'В PDF',
        },
    ],
});