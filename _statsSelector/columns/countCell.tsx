import * as React from 'react';
import {ColumnTemplate, IColumnTemplateProps} from 'Controls/grid';
import {Number} from 'Controls/baseDecorator';

/**
 * Колонка с числом
 */
export default (props: IColumnTemplateProps) => {
    const templateOptions = props.column.getTemplateOptions();
    const value = props.column.getDisplayValue() || 0;

    return <ColumnTemplate
            {...props}
            contentTemplate={(contentTemplate) => {
                return (
                    <Number value={value}
                            fontSize="m"/>
                );
            }}
    />
};
