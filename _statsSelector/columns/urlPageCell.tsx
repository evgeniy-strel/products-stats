import * as React from 'react';
import {ColumnTemplate, IColumnTemplateProps} from 'Controls/grid';
import { Button } from 'Controls/buttons';

/**
 * Колонка с URL
 */
export default React.memo((props: IColumnTemplateProps) => {
    const title = '/page/' + props.column.getDisplayValue() as string;

    return <ColumnTemplate
            {...props}
            contentTemplate={(contentTemplate) => {
                return !props.column.getDisplayValue() ? <div>
                    не указан
                </div> : (
                    <Button
                            className="tw-truncate"
                            target="_blank"
                            readOnly={false}
                            href={title}
                            caption={title}
                            viewMode="link"/>
                );
            }}
    />
});
