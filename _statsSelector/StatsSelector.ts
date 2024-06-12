import * as Template from 'wml!ComponentStats/_statsSelector/template/StatsSelector';
import 'css!CommonAppMarket/components';

import 'css!ComponentStats/_statsSelector/template/StatsSelector';

import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {Loader as DataLoader } from 'Controls-DataEnv/dataLoader';
import {TDataConfigs} from 'Controls-DataEnv/dataFactory';
import {Record as RecordEntity} from 'Types/entity';
import {Clipboard} from 'Clipboard/clipboards';
import { getStableAppUUID } from '../../CommonAppMarket/_helpers/calculateParams';
import { readDeveloperInfo } from 'CommonAppMarket/utils/loaders';

const MASTER_ITEMS = new RecordSet({
    keyProperty: 'Title',
    rawData: [
        {
            Title: 'Общая сводка',
            template: 'ComponentStats/_statsSelector/screens/GeneralSummary',
            loader: 'GeneralSummaryLoader',
            icon: 'icon-TFPreview'
        },
        {
            Title: 'Посещаемость страниц',
            template: 'ComponentStats/_statsSelector/screens/PageViews',
            loader: 'PageViewsLoader',
            icon: 'icon-LevelHigh'
        },
        {
            Title: 'Действия клиентов',
            template: 'ComponentStats/_statsSelector/screens/Activities',
            loader: 'ActivitiesLoader',
            icon: 'icon-Preview'
        },
        {
            Title: 'Активные клиенты',
            template: 'ComponentStats/_statsSelector/screens/Clients',
            loader: 'ClientsLoader',
            icon:'icon-Profile2'
        },
        {
            Title: 'Статистика по регионам',
            template: 'ComponentStats/_statsSelector/screens/RegionStats',
            loader: 'RegionStatsLoader',
            icon:'icon-Location'
        },
    ]
});

const DEFAULT_MARKED_KEY_MASTER = MASTER_ITEMS.at(0).getKey();

export default class StatsSelector extends Control {
    protected _template: TemplateFunction = Template;
    protected _masterItemActive: RecordEntity = MASTER_ITEMS.getRecordById(DEFAULT_MARKED_KEY_MASTER);
    protected _masterItems: RecordSet = MASTER_ITEMS;
    protected _markedKeyMaster: string = DEFAULT_MARKED_KEY_MASTER;
    protected _indicatorId: number;

    protected _configs: Record<string, TDataConfigs> = {};
    protected _loadResults: Record<string, unknown> = {};

    protected _record: RecordEntity;

    protected _beforeMount(options: IControlOptions): void {
        this._record = options.record;
        this._updateDeveloperInfo(options.employee, this._record.get('DeveloperFaceID'));
        this._loadConfigs(options);
    }

    protected _beforeUpdate(options: IControlOptions): void {
    }

    protected _afterMount(): void {
        if (!this._configs[this._markedKeyMaster]) {
            this._indicatorId = this._children.loadingIndicator?.show();
        }
    }

    private _loadConfigs(options: IControlOptions): void {
        if (this._configs[this._markedKeyMaster]) {
            return;
        }

        if (this._options) {
            if (!this._configs[this._markedKeyMaster]) {
                this._indicatorId = this._children.loadingIndicator?.show();
            }
        }

        import('ComponentStats/statsSelector').then((res) => {
            const loader = res[this._masterItemActive.get('loader')];
            const params = { record: options.record };

            const configs = loader.getConfig(params) as TDataConfigs;
            this._getData(configs).then(() => {
                this._configs = {...this._configs, [this._markedKeyMaster]: configs};

                if (this._indicatorId) {
                    this._children.loadingIndicator?.hide(this._indicatorId);
                    this._indicatorId = null;
                }
            });
        });
    }

    private _getData(configs: TDataConfigs): Promise<void> {
        return DataLoader.load(configs, 0).then((res) => {
            this._loadResults[this._markedKeyMaster] = res;
        });
    }

    protected _markedKeyMasterChanged(e: Event, key: string): void {
        if (!this._configs[this._markedKeyMaster]) return;

        this._markedKeyMaster = key;
        this._masterItemActive = this._masterItems.getRecordById(key);

        this._loadConfigs(this._options);
    }

    protected _copyLink(): void {
        const uuid = getStableAppUUID(this._record);

        let url = [location.protocol, '//'];
        url.push(String(location.host));
        url.push(`/market-package/${uuid}`);

        new Clipboard().setText(url.join(''));
    }

    protected _updateDeveloperInfo(employee: RecordEntity, developerFaceId: string): Promise<void> {
        return readDeveloperInfo(developerFaceId).then((person) => {
            if (!person) {
                return;
            }
            const personId = person.get('PersonID');
            this._developerFaceId = developerFaceId || personId;
            this._photoId = person.get('PhotoID');
            this._fullName = person.get('FullName');
            this._departament = person.get('Department');
        });
    }
}