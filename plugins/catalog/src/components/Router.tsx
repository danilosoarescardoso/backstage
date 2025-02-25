/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { DEFAULT_NAMESPACE } from '@backstage/catalog-model';
import {
  AsyncEntityProvider,
  useEntity,
  useEntityFromUrl,
} from '@backstage/plugin-catalog-react';
import { Typography } from '@material-ui/core';
import React, { ComponentType, ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';
import { CatalogPage } from './CatalogPage';
import { EntityNotFound } from './EntityNotFound';
import { EntityPageLayout } from './EntityPageLayout';
import { Content, Link } from '@backstage/core-components';

const DefaultEntityPage = () => (
  <EntityPageLayout>
    <EntityPageLayout.Content
      path="/"
      title="Overview"
      element={
        <Content>
          <Typography variant="h2">This is the default entity page.</Typography>
          <Typography variant="body1">
            To override this component with your custom implementation, read
            docs on{' '}
            <Link to="https://backstage.io/docs">backstage.io/docs</Link>
          </Typography>
        </Content>
      }
    />
  </EntityPageLayout>
);

const EntityPageSwitch = ({ EntityPage }: { EntityPage: ComponentType }) => {
  const { entity, loading, error } = useEntity();
  // Loading and error states
  if (loading) return <EntityPageLayout />;
  if (error || !entity) return <EntityNotFound />;

  // Otherwise EntityPage provided from the App
  // Note that EntityPage will include EntityPageLayout already
  return <EntityPage />;
};

const OldEntityRouteRedirect = () => {
  const { optionalNamespaceAndName, '*': rest } = useParams() as any;
  const [name, namespace] = optionalNamespaceAndName.split(':').reverse();
  const namespaceLower =
    namespace?.toLocaleLowerCase('en-US') ?? DEFAULT_NAMESPACE;
  const restWithSlash = rest ? `/${rest}` : '';
  return (
    <Navigate
      to={`../../${namespaceLower}/component/${name}${restWithSlash}`}
    />
  );
};

export const EntityLoader = (props: { children: ReactNode }) => (
  <AsyncEntityProvider {...useEntityFromUrl()} {...props} />
);

/**
 * @deprecated Use plugin extensions instead
 * */
export const Router = ({
  EntityPage = DefaultEntityPage,
}: {
  EntityPage?: ComponentType;
}) => (
  <Routes>
    <Route path="/" element={<CatalogPage />} />
    <Route
      path="/:namespace/:kind/:name"
      element={
        <EntityLoader>
          <EntityPageSwitch EntityPage={EntityPage} />
        </EntityLoader>
      }
    />
    <Route
      path="Component/:optionalNamespaceAndName/*"
      element={<OldEntityRouteRedirect />}
    />
  </Routes>
);
