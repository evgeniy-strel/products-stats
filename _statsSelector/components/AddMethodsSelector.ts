import * as template from 'wml!ComponentStats/_statsSelector/components/AddMethodsSelector/AddMethodsSelector';

import {Control, IControlOptions} from 'UI/Base';
import {TemplateFunction} from 'UI/Base';
import {SbisService} from 'Types/source';
import {ISource, INavigation} from 'Controls/interface';

export default class BindingMethodSelector extends Control {
    readonly _template: TemplateFunction = template;
    protected _searchValue: string;
    protected _selectedKeys: string[] | number[];
    protected _source: ISource = new SbisService({
        endpoint: 'Binding',
        keyProperty: 'Binding',
        binding: { query: 'List' }
    });

    protected _navigation: INavigation = {
        source: 'page',
        view: 'infinity',
        sourceConfig: {
            pageSize: 40,
            page: 0
        }
    };

    protected _beforeMount(options: IControlOptions): void {
        this._selectedKeys = options.selectedKeys;
    }
}
