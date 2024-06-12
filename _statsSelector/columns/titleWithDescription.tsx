import * as React from 'react';
import {ColumnTemplate, IColumnTemplateProps} from 'Controls/grid';
import {Number} from 'Controls/baseDecorator';

/**
 * Колонка с заголовком
 */
export default React.memo((props: IColumnTemplateProps) => {
    const title = props.column.getDisplayValue() as string;
    const additionalProperty = props.additionalProperty || 'Description';
    const description = props.item.contents.get(additionalProperty) as string;

    return <ColumnTemplate
            {...props}
            contentTemplate={(contentTemplate) => {
                return (
                    <div className="tw-truncate">
                        <div className="tw-truncate" title={`${title}`}>{ title }</div>
                        {description && (
                            <div className="controls-fontsize-xs controls-fontweight-normal controls-text-unaccented tw-truncate controls-margin_top-2xs" title={`${description}`}>
                                { description }
                            </div>
                        )}
                    </div>
                );
            }}
    />
});
