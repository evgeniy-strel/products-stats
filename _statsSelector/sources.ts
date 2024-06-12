import { SbisService } from 'Types/source';
import { Model } from 'Types/entity';

export function getSource(
    queryName: string,
    contract: string = 'ComponentStats',
    isServicePool: boolean = false,
    model?: Model
): SbisService {
    return new SbisService({
        keyProperty: 'Id',
        endpoint: {
            contract,
            address: `/service/${isServicePool ? '?srv=1' : ''}`
        },
        binding: {
            query: queryName
        },
        model
    });
}

export const activitiesSource = new SbisService({
    endpoint: 'Activity',
    keyProperty: '@Activity',
    binding: {
        query: 'ListWithDeclaration',
        create: 'Create',
        read: 'Read',
        update: 'Update',
        destroy: 'Delete'
    }
});