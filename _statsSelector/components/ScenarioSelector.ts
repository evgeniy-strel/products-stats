import * as template from 'wml!ComponentStats/_statsSelector/components/ScenarioSelector/ScenarioSelector';
import { activitiesSource } from '../sources';

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory, SbisService, PrefetchProxy, DataSet} from 'Types/source';
import {RecordSet, Enum} from 'Types/collection';
import {Record} from 'Types/entity';
import {IFilter, INavigation, IItemAction, ISelectorTemplate} from 'Controls/interface';
import {TItemActionShowType} from 'Controls/itemActions';
import {Confirmation} from 'Controls/popup';
import {IItemAddOptions} from 'Controls/list';
import {isMaskFormatValid} from 'Controls/input';
import type {IFormatMaskChars} from 'Controls/interface';

interface IActivityDeclaration {
    '@ActivityDeclaration': number;
    Binding: string;
    BindingType: Enum<EBindingType>;
}

interface IScenarioSelector extends IControlOptions{
    record?: Record;
    createMetaData: object;
}

enum MaskSeparators {
    dot = '.',
    arrow = '->'
}

/* Тип привязки: метод, или помеченный код для статистики [css] */
enum EBindingType {
    method = 1,
    functional = 2
}

/*
 * Частота периодов
 * 0: "сутки"
 * 1: "неделю"
 * 2: "месяц"
 * 3: "квартал"
*/
export enum EFrequencyPeriod {
    day, week, month, quarter
}

const masks: string[] = [
    'X.X.X',
    'x*.X.X', 'x*->X->X',
    'X.x*.X', 'X->x*->X',
    'X.X.x*', 'X->X->x*'
];

const formatMaskChars: IFormatMaskChars = {
    x: '[^\*]*',
    X: '[^\*]+',
    '*': '[\*]',
    '.': '[\.]',
    '-': '-',
    '>': '>'
};

/**
 * Стек-панель для создания сценария и выбора / добавления методов в него
 * CommonAppMarket/_editComponents/selectors/ScenarioSelector
 * @extends UI/Base:Control
 * @author Кошак Л.В.
 * @public
 */
export default class ScenarioSelector extends Control<IScenarioSelector> {
    readonly _template: TemplateFunction = template;
    protected _items: RecordSet;
    protected _initialItems: RecordSet;
    protected _record: Record;
    protected _source: SbisService = activitiesSource;
    protected _createMetaData: object;
    protected _isEditingItem: boolean;
    protected _isNewRecord: boolean;
    protected _readOnly: boolean;
    protected _activityDeclarationFilter: IFilter = {};
    protected _activityDeclarationSource: SbisService | PrefetchProxy = new SbisService({
        endpoint: 'ActivityDeclaration',
        keyProperty: '@ActivityDeclaration',
        binding: { query: 'List', create: 'Create', read: 'Read', update: 'Update', destroy: 'Delete' },
        passing: { create: this._createPassing.bind(this) }
    });

    protected _activityDeclarationActions: IItemAction[] = [{
        id: 'delete',
        icon: 'icon-Erase',
        iconStyle: 'error',
        title: 'Удалить',
        showType: TItemActionShowType.TOOLBAR,
        handler: this._deleteHandler.bind(this)
    }];

    protected _bindingListSource: SbisService = new SbisService({
        endpoint: 'Binding',
        keyProperty: 'Binding',
        binding: { query: 'List' }
    });

    protected _bindingListNavigation: INavigation = {
        source: 'page',
        view: 'demand',
        sourceConfig: {
            pageSize: 10,
            page: 0
        }
    };

    protected _bindingListSelectorTemplate: Partial<ISelectorTemplate> = {
        templateName: 'ComponentStats/statsSelector:AddMethodsSelector',
        popupOptions: {
            propStorageId: 'CommonAppMarket_BindingMethodSelector',
            width: 500,
            maxWidth: 750,
            minWidth: 450
        }
    };

    protected _beforeMount(options: IScenarioSelector): void {
        this._activityDeclarationReadyCallback = this._activityDeclarationReadyCallback.bind(this);
        this._activityActionVisibilityCallback = this._activityActionVisibilityCallback.bind(this);
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
        this._createMetaData = options.createMetaData;
        this._readOnly = options.readOnly;
        this._setData(options.record?.clone());
    }

    protected _onCreateSuccessed(_: Event, record: Record): void {
        this._setData(record);
        this._beginAdd(undefined, {shouldActivateInput: false});
    }

    private _createPassing(meta: object): object {
        return {
            Фильтр: Record.fromObject({
                ...meta,
                Activity: this._record?.getId(),
                BindingType: EBindingType.method,
                ВызовИзБраузера: true
            }, 'adapter.sbis'),
            ИмяМетода: null
        };
    }

    private _setData(record: Record): void {
        /* Если создаем новую запись - незачем делать запрос на получение методов */
        if (!record) {
            this._isNewRecord = true;
            this._activityDeclarationSource = new PrefetchProxy({
                target: this._activityDeclarationSource,
                data: {query: new DataSet({ adapter: 'adapter.sbis'})}
            });
            return;
        }

        this._record = record;
        this._activityDeclarationFilter.Activity = this._record?.getId();
    }

    protected _closeStack(): void {
        this._children.stack?.close();
    }

    protected _save(): void {
        this._children.formController.validate().then((errors) => {
            if (errors.hasErrors) {
                return;
            }
            if (this._children.infobox && this._isEditingItem) {
                this._children.infobox.open();
                return;
            }

            if (this._record.isChanged() || !this._items.isEqual(this._initialItems)) {
                this._source.update(this._record).then(() => {
                    this._notify('sendResult', [{needReload: true, item: this._record}], { bubbling: true });
                    this._children.formController.read(this._record.getId()).then(() => {
                        this._notify('close', [], { bubbling: true });
                    });
                }).catch(() => {
                    Confirmation.openPopup({
                        type: 'ok',
                        message: 'Не удалось выполнить действие',
                        style: 'danger',
                        details: 'Идентификатор сценария активности должен быть уникальным в рамках текущего компонента'
                    });
                });
            } else {
                this._notify('close', [], { bubbling: true });
            }
        });
    }

    protected _itemsReadyCallback(items: RecordSet): void {
        this._items = items;
        this._initialItems = this._items.clone();
        this._isEditingItem = items.getCount() === 0;
    }

    protected _deleteHandler(item: Record<IActivityDeclaration>): void {
        this._children.activityDeclarationList.removeItems({
            selected: [item.getId()],
            excluded: []
        }).then(() => this._children.activityDeclarationList.reload());
    }

    protected _beginAdd(event: Event, options?: IItemAddOptions): void {
        this._children.activityDeclarationList.beginAdd(options);
    }

    protected _beforeEndEdit(_: Event, item: Record<IActivityDeclaration>, willSave: boolean, isAdd: boolean): void {
        if (isAdd && !willSave) {
            this._deleteHandler(item);
        }
        this._isEditingItem = false;
    }

    protected _afterBeginEdit(): void {
        this._isEditingItem = true;
    }

    protected _activityActionVisibilityCallback(
        itemAction: IItemAction,
        item: Record<IActivityDeclaration>,
        isEditing: boolean
    ): boolean | void {
        return !isEditing && !this._readOnly;
    }

    protected _showSelectorInsideLabel(): void {
        this._children.bindingListLookup.showSelector();
    }

    protected _activityDeclarationReadyCallback(items: RecordSet<IActivityDeclaration>): void {
        const item: Record<IActivityDeclaration> = new Record({
            format: items.getFormat(),
            adapter: items.getAdapter()
        });
        item.get('BindingType').set(EBindingType.method);
        this._children.activityDeclarationList.beginAdd({ item });
    }

    protected _isMethod(bindingType: Enum<EBindingType>): boolean {
        return bindingType.get() === EBindingType.method;
    }
}

interface IBindingValidator extends IBaseValidator {
    bindingType: Enum<EBindingType>;
}

/**
 * Функция, валидирующая функционал по маске:
 * 1) Два одинаковых разделителя: "." или "->"
 * 2) Необязательная звездочка перед разделителем
 */
export function bindingValidator({value, message, bindingType}: IBindingValidator): boolean | string {
    if (bindingType.get() === EBindingType.method) return true;

    /* Удаляем пробелы */
    value = value?.replace(/\s+/g, '');

    const separator = value?.includes(MaskSeparators.arrow) ? MaskSeparators.arrow :
        value?.includes(MaskSeparators.dot) ? MaskSeparators.dot : '';
    if (!separator || value.split(separator).filter(x => x).length !== 3) return message;

    const isMaskValid = masks.some((mask) => isMaskFormatValid(value, mask, '', formatMaskChars));
    return isMaskValid ? true : message;
}
