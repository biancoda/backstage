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

import { ReaderFactory, UrlReader } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import yaml from 'yaml';
import { mockOrg } from '../data/mockOrg';

export async function buildMockReader(config: Config): Promise<ReaderFactory> {
  const dataConfig = config.getConfig('performanceTest.data');
  const entities = [...(await mockOrg(dataConfig))];

  const reader: UrlReader = {
    async read(): Promise<Buffer> {
      return Buffer.from(
        entities.map(entity => `---\n${yaml.stringify(entity)}`).join('\n'),
      );
    },
    readTree() {
      throw new TypeError('readTree is not supported');
    },
  };

  return () => [{ predicate: () => true, reader }];
}
