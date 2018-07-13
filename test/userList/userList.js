import _ from 'lodash';
import Bottle from 'bottlejs';

import c from '../../src';

export default() => {
  const b = new Bottle();

  b.constant('users', c.toData([], 'users'));

  b.constant('usersById', c.toData(new Map(), 'usersById'));

  b.factory('usersToById', container => container.users.key(user => user.id, container.usersById).init());

  b.constant('sortedUserIDs', c.toData([], 'sortedUserIDs'));
  b.factory(
    'usersToSortedIDs',
    container => container.users.filterTo(
      (userList) => {
        const out = _(userList).sortBy('lastName', 'firstName', 'id').map('id').value();
        return out;
      },
      container.sortedUserIDs,
    ).init(),
  );

  return b.container;
};
