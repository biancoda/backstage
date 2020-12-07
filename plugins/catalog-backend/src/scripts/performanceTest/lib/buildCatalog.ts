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

import {
  SingleConnectionDatabaseManager,
  UrlReaders,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { createLogger } from 'winston';
import { CatalogBuilder } from '../../../service/CatalogBuilder';
import { buildMockReader } from './buildMockReader';

export async function buildCatalog(config: Config) {
  const logger = createLogger();

  const databaseManager = SingleConnectionDatabaseManager.fromConfig(config);
  const database = databaseManager.forPlugin('performanceTest');

  const reader = UrlReaders.create({
    config,
    logger,
    factories: [await buildMockReader(config)],
  });

  const env = { logger, database, config, reader };
  return new CatalogBuilder(env).build();
}
