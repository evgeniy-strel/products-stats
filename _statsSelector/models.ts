import {Model} from 'Types/entity';
import { getShortDateFormat } from './helpers';

export interface IComponentStatsUserProperties {
    Name: {
        get: Function;
    };
    RegionName: {
        get: Function;
    };
    FormattedID: {
        get: Function;
    };
    LastActivity: {
        get: Function;
    };
    DateBegin: {
        get: Function;
    };
    DateEnd: {
        get: Function;
    };
    LeftDate: {
        get: Function;
    };
}

export class ComponentStatsUserModel extends Model {
    _moduleName: string;
    _$properties: IComponentStatsUserProperties = {
        Name: {
            get(): string {
                return this.get('AccountInfo')?.get('Name') || 'Удален';
            }
        },
        RegionName: {
            get(): string {
                return this.get('AccountInfo')?.get('RegionName');
            }
        },
        FormattedID: {
            get(): string {
                return this.get('AccountInfo')?.get('FormattedID');
            }
        },
        LastActivity: {
            get(): string {
                if (!(this.get('AccountInfo')?.get('LastActivity') instanceof Date)) return '';
                return getShortDateFormat(this.get('AccountInfo')?.get('LastActivity'), 'month');
            }
        },
        DateBegin: {
            get(): string {
                return this.get('License')?.get('DateBegin');
            }
        },
        DateEnd: {
            get(): string {
                return this.get('License')?.get('DateEnd');
            }
        },
        LeftDate: {
            get(): string {
                return this.get('License')?.get('text_left_date')?.replace('ост', '')?.replace('ист', '')?.trim();
            }
        },
    };
}