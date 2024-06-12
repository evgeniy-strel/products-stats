import * as React from 'react';
import {ColumnTemplate, IColumnTemplateProps} from 'Controls/grid';
import {Number} from 'Controls/baseDecorator';

/**
 * Колонка «проценты»
 */
export default React.memo((props: IColumnTemplateProps) => {
    const value = props.column.getDisplayValue() as number || 0;
    const className = value === 0 ? '' : value > 0 ? 'controls-text-success' : 'controls-text-danger';

    return <ColumnTemplate
            {...props}
            contentTemplate={(contentTemplate) => {
                return (
                    <div className={className}>{value}%</div>
                );
            }}
    />
});
