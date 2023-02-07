import * as React from 'react';
import { DatabaseFilled, DatabaseOutlined } from '@ant-design/icons';
import { Dataset, DatasetProperties, EntityType, OwnershipType, SearchResult } from '../../../types.generated';
import { Entity, EntityCapabilityType, IconStyleType, PreviewType } from '../Entity';
import { Preview } from './preview/Preview';
import { EntityProfile } from '../shared/containers/profile/EntityProfile';
import { GetDatasetQuery, useGetDatasetQuery, useUpdateDatasetMutation } from '../../../graphql/dataset.generated';
import { GenericEntityProperties } from '../shared/types';
import { PropertiesTab } from '../shared/tabs/Properties/PropertiesTab';
import { DocumentationTab } from '../shared/tabs/Documentation/DocumentationTab';
import { SchemaTab } from '../shared/tabs/Dataset/Schema/SchemaTab';
import QueriesTab from '../shared/tabs/Dataset/Queries/QueriesTab';
import { SidebarAboutSection } from '../shared/containers/profile/sidebar/SidebarAboutSection';
import { SidebarOwnerSection } from '../shared/containers/profile/sidebar/Ownership/SidebarOwnerSection';
import { SidebarTagsSection } from '../shared/containers/profile/sidebar/SidebarTagsSection';
import StatsTab from '../shared/tabs/Dataset/Stats/StatsTab';
import { LineageTab } from '../shared/tabs/Lineage/LineageTab';
import { capitalizeFirstLetter } from '../../shared/textUtil';
import ViewDefinitionTab from '../shared/tabs/Dataset/View/ViewDefinitionTab';
import { SidebarViewDefinitionSection } from '../shared/containers/profile/sidebar/Dataset/View/SidebarViewDefinitionSection';
import { SidebarRecommendationsSection } from '../shared/containers/profile/sidebar/Recommendations/SidebarRecommendationsSection';
import { getDataForEntityType } from '../shared/containers/profile/utils';
import { SidebarDomainSection } from '../shared/containers/profile/sidebar/Domain/SidebarDomainSection';
import { ValidationsTab } from '../shared/tabs/Dataset/Validations/ValidationsTab';
import { OperationsTab } from './profile/OperationsTab';
import { EntityMenuItems } from '../shared/EntityDropdown/EntityDropdown';
import { SidebarSiblingsSection } from '../shared/containers/profile/sidebar/SidebarSiblingsSection';
import { DatasetStatsSummarySubHeader } from './profile/stats/stats/DatasetStatsSummarySubHeader';
import { DatasetSearchSnippet } from './DatasetSearchSnippet';

const SUBTYPES = {
    VIEW: 'view',
};

/**
 * Definition of the DataHub Dataset entity.
 */
export class DatasetEntity implements Entity<Dataset> {
    type: EntityType = EntityType.Dataset;

    icon = (fontSize: number, styleType: IconStyleType) => {
        if (styleType === IconStyleType.TAB_VIEW) {
            return <DatabaseOutlined style={{ fontSize }} />;
        }

        if (styleType === IconStyleType.HIGHLIGHT) {
            return <DatabaseFilled style={{ fontSize, color: '#B37FEB' }} />;
        }

        if (styleType === IconStyleType.SVG) {
            return (
                <path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V408h560v208zm0 272H232V680h560v208zM304 240a40 40 0 1080 0 40 40 0 10-80 0zm0 272a40 40 0 1080 0 40 40 0 10-80 0zm0 272a40 40 0 1080 0 40 40 0 10-80 0z" />
            );
        }

        return (
            <DatabaseOutlined
                style={{
                    fontSize,
                    color: '#BFBFBF',
                }}
            />
        );
    };

    isSearchEnabled = () => true;

    isBrowseEnabled = () => true;

    isLineageEnabled = () => true;

    getAutoCompleteFieldName = () => 'name';

    getPathName = () => 'dataset';

    getEntityName = () => 'Dataset';

    getCollectionName = () => 'Datasets';

    renderProfile = (urn: string) => (
        <EntityProfile
            urn={urn}
            entityType={EntityType.Dataset}
            useEntityQuery={useGetDatasetQuery}
            useUpdateQuery={useUpdateDatasetMutation}
            getOverrideProperties={this.getOverridePropertiesFromEntity}
            headerDropdownItems={new Set([EntityMenuItems.UPDATE_DEPRECATION])}
            subHeader={{
                component: DatasetStatsSummarySubHeader,
            }}
            tabs={[
                {
                    name: 'Documentation',
                    component: DocumentationTab,
                },
                {
                    name: 'Properties',
                    component: PropertiesTab,
                },
                {
                    name: 'Schema',
                    component: SchemaTab,
                },
                {
                    name: 'View Definition',
                    component: ViewDefinitionTab,
                    display: {
                        visible: (_, dataset: GetDatasetQuery) =>
                            (dataset?.dataset?.subTypes?.typeNames?.includes(SUBTYPES.VIEW) && true) || false,
                        enabled: (_, dataset: GetDatasetQuery) =>
                            (dataset?.dataset?.viewProperties?.logic && true) || false,
                    },
                },
                {
                    name: 'Lineage',
                    component: LineageTab,
                    display: {
                        visible: (_, _1) => true,
                        enabled: (_, dataset: GetDatasetQuery) => {
                            return (
                                (dataset?.dataset?.upstream?.total || 0) > 0 ||
                                (dataset?.dataset?.downstream?.total || 0) > 0
                            );
                        },
                    },
                },
                {
                    name: 'Queries',
                    component: QueriesTab,
                    display: {
                        visible: (_, _1) => true,
                        enabled: (_, dataset: GetDatasetQuery) =>
                            (dataset?.dataset?.usageStats?.buckets?.length || 0) > 0,
                    },
                },
                {
                    name: 'Stats',
                    component: StatsTab,
                    display: {
                        visible: (_, _1) => true,
                        enabled: (_, dataset: GetDatasetQuery) =>
                            (dataset?.dataset?.datasetProfiles?.length || 0) > 0 ||
                            (dataset?.dataset?.usageStats?.buckets?.length || 0) > 0 ||
                            (dataset?.dataset?.operations?.length || 0) > 0,
                    },
                },
                {
                    name: 'Validation',
                    component: ValidationsTab,
                    display: {
                        visible: (_, _1) => true,
                        enabled: (_, dataset: GetDatasetQuery) => {
                            return (
                                (dataset?.dataset?.assertions?.total || 0) > 0 || dataset?.dataset?.testResults !== null
                            );
                        },
                    },
                },
                {
                    name: 'Operations',
                    component: OperationsTab,
                    display: {
                        visible: (_, dataset: GetDatasetQuery) => {
                            return (
                                (dataset?.dataset?.readRuns?.total || 0) + (dataset?.dataset?.writeRuns?.total || 0) > 0
                            );
                        },
                        enabled: (_, dataset: GetDatasetQuery) => {
                            return (
                                (dataset?.dataset?.readRuns?.total || 0) + (dataset?.dataset?.writeRuns?.total || 0) > 0
                            );
                        },
                    },
                },
            ]}
            sidebarSections={[
                {
                    component: SidebarAboutSection,
                },
                {
                    component: SidebarOwnerSection,
                    properties: {
                        defaultOwnerType: OwnershipType.TechnicalOwner,
                    },
                },
                {
                    component: SidebarSiblingsSection,
                    display: {
                        visible: (_, dataset: GetDatasetQuery) =>
                            (dataset?.dataset?.siblings?.siblings?.length || 0) > 0,
                    },
                },
                {
                    component: SidebarViewDefinitionSection,
                    display: {
                        visible: (_, dataset: GetDatasetQuery) =>
                            (dataset?.dataset?.viewProperties?.logic && true) || false,
                    },
                },
                {
                    component: SidebarTagsSection,
                    properties: {
                        hasTags: true,
                        hasTerms: true,
                    },
                },
                {
                    component: SidebarDomainSection,
                },
                {
                    component: SidebarRecommendationsSection,
                },
            ]}
        />
    );

    getOverridePropertiesFromEntity = (dataset?: Dataset | null): GenericEntityProperties => {
        // if dataset has subTypes filled out, pick the most specific subtype and return it
        const subTypes = dataset?.subTypes;
        const extendedProperties: DatasetProperties | undefined | null = dataset?.properties && {
            ...dataset?.properties,
            qualifiedName: dataset?.properties?.qualifiedName || dataset?.name,
        };
        return {
            name: dataset?.properties?.name || dataset?.name,
            externalUrl: dataset?.properties?.externalUrl,
            entityTypeOverride: subTypes ? capitalizeFirstLetter(subTypes.typeNames?.[0]) : '',
            properties: extendedProperties,
        };
    };

    renderPreview = (_: PreviewType, data: Dataset) => {
        return (
            <Preview
                urn={data.urn}
                name={data.properties?.name || data.name}
                origin={data.origin}
                subtype={data.subTypes?.typeNames?.[0]}
                description={data.editableProperties?.description || data.properties?.description}
                platformName={data.platform.properties?.displayName || data.platform.name}
                platformLogo={data.platform.properties?.logoUrl}
                platformInstanceId={data.dataPlatformInstance?.instanceId}
                owners={data.ownership?.owners}
                globalTags={data.globalTags}
                glossaryTerms={data.glossaryTerms}
                domain={data.domain?.domain}
                container={data.container}
            />
        );
    };

    renderSearch = (result: SearchResult) => {
        const data = result.entity as Dataset;
        const genericProperties = this.getGenericEntityProperties(data);

        return (
            <Preview
                urn={data.urn}
                name={data.properties?.name || data.name}
                origin={data.origin}
                description={data.editableProperties?.description || data.properties?.description}
                platformName={data.platform.properties?.displayName || data.platform.name}
                platformLogo={data.platform.properties?.logoUrl}
                platformInstanceId={data.dataPlatformInstance?.instanceId}
                platformNames={genericProperties?.siblingPlatforms?.map(
                    (platform) => platform.properties?.displayName || platform.name,
                )}
                platformLogos={genericProperties?.siblingPlatforms?.map((platform) => platform.properties?.logoUrl)}
                owners={data.ownership?.owners}
                globalTags={data.globalTags}
                domain={data.domain?.domain}
                deprecation={data.deprecation}
                glossaryTerms={data.glossaryTerms}
                subtype={data.subTypes?.typeNames?.[0]}
                container={data.container}
                parentContainers={data.parentContainers}
                snippet={<DatasetSearchSnippet matchedFields={result.matchedFields} />}
                insights={result.insights}
                externalUrl={data.properties?.externalUrl}
                statsSummary={data.statsSummary}
                rowCount={(data as any).lastProfile?.length && (data as any).lastProfile[0].rowCount}
                lastUpdatedMs={
                    (data as any).lastOperation?.length && (data as any).lastOperation[0].lastUpdatedTimestamp
                }
            />
        );
    };

    getLineageVizConfig = (entity: Dataset) => {
        return {
            urn: entity?.urn,
            name: entity?.properties?.name || entity.name,
            expandedName: entity?.properties?.qualifiedName || entity?.properties?.name || entity.name,
            type: EntityType.Dataset,
            subtype: entity?.subTypes?.typeNames?.[0] || undefined,
            icon: entity?.platform?.properties?.logoUrl || undefined,
            platform: entity?.platform,
        };
    };

    displayName = (data: Dataset) => {
        return data?.properties?.name || data.name || data.urn;
    };

    platformLogoUrl = (data: Dataset) => {
        return data.platform.properties?.logoUrl || undefined;
    };

    getGenericEntityProperties = (data: Dataset) => {
        return getDataForEntityType({
            data,
            entityType: this.type,
            getOverrideProperties: this.getOverridePropertiesFromEntity,
        });
    };

    supportedCapabilities = () => {
        return new Set([
            EntityCapabilityType.OWNERS,
            EntityCapabilityType.GLOSSARY_TERMS,
            EntityCapabilityType.TAGS,
            EntityCapabilityType.DOMAINS,
            EntityCapabilityType.DEPRECATION,
            EntityCapabilityType.SOFT_DELETE,
        ]);
    };
}
