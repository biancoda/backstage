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

import { Entity, GroupEntity, UserEntity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  buildMemberOf,
  buildOrgHierarchy,
} from '../../../ingestion/processors/util/org';

type Properties = {
  userCount: number;
  groupCount: number;
  userMemberOfGroupsCountMax: number;
};

function* mockGroups({ groupCount }: Properties): Generator<GroupEntity> {
  for (let i = 0; i < groupCount; ++i) {
    const parent: string | undefined =
      i > 0 ? `group${Math.floor(Math.random() * i)}` : undefined;

    const group: GroupEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: `group${i}` },
      spec: {
        type: 'team',
        parent,
        children: [],
      },
    };

    yield group;
  }
}

function* mockUsers({
  userCount,
  groupCount,
  userMemberOfGroupsCountMax,
}: Properties): Generator<UserEntity> {
  for (let i = 0; i < userCount; ++i) {
    const memberOf = new Array<string>();
    const membershipCount = Math.round(
      Math.random() * userMemberOfGroupsCountMax,
    );
    for (let j = 0; j < membershipCount; ++j) {
      memberOf.push(`group${Math.floor(Math.random() * groupCount)}`);
    }

    const user: UserEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: { name: `user${i}` },
      spec: { memberOf },
    };

    yield user;
  }
}

export async function mockOrg(dataRoot: Config): Promise<Entity[]> {
  const config = dataRoot.getOptionalConfig('mockOrg');
  if (!config) {
    return [];
  }

  const properties: Properties = {
    userCount: config.getNumber('userCount'),
    groupCount: config.getNumber('groupCount'),
    userMemberOfGroupsCountMax: config.getNumber('userMemberOfGroupsCountMax'),
  };

  const groups = Array.from(mockGroups(properties));
  const users = Array.from(mockUsers(properties));

  buildOrgHierarchy(groups);
  buildMemberOf(groups, users);

  return [...users, ...groups];
}
