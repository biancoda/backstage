/*
 * Copyright 2020 Spotify AB
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

import { Config } from '@backstage/config';
import { AzureIntegration } from './azure/AzureIntegration';
import { BitbucketIntegration } from './bitbucket/BitbucketIntegration';
import { GitHubIntegration } from './github/GitHubIntegration';
import { GitLabIntegration } from './gitlab/GitLabIntegration';
import {
  ScmIntegration,
  ScmIntegrationPredicateTuple,
  ScmIntegrations,
} from './types';

export class ScmIntegrationsImpl implements ScmIntegrations {
  static fromConfig(config: Config): ScmIntegrationsImpl {
    return new ScmIntegrationsImpl([
      ...AzureIntegration.factory({ config }),
      ...BitbucketIntegration.factory({ config }),
      ...GitHubIntegration.factory({ config }),
      ...GitLabIntegration.factory({ config }),
    ]);
  }

  constructor(private readonly integrations: ScmIntegrationPredicateTuple[]) {}

  list(): ScmIntegration[] {
    return this.integrations.map(i => i.integration);
  }

  byName(name: string): ScmIntegration | undefined {
    return this.integrations.map(i => i.integration).find(i => i.name === name);
  }

  byUrl(url: string): ScmIntegration | undefined {
    return this.integrations.find(i => i.predicate(new URL(url)))?.integration;
  }
}