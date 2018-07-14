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

  b.constant('searchTerms', c.toData(new Map(), 'searchTerms'));
  b.factory('usersToSearchTerms', c => c.usersById.mapTo(
    (user) => {
      const { firstName, lastName, email } = user;
      const result = [firstName, lastName, email].join('\t').toLowerCase();
      return result;
    },
    c.searchTerms,
  ).init());

  b.constant('searchPhrase', c.toData('', 'searchPhrase'));
  b.constant('foundIndexes', c.toData([], 'foundIndexes'));

  b.factory('searchToFoundIndexes', (container) => {
    container.searchTerms.reduceTo((memo, term, id, change, { searchPhrase }) => {
      // if (id < 3) console.log('searchPhrase', searchPhrase);
      if (!searchPhrase) memo.push(id);
      else {
        if (term.indexOf(searchPhrase.toLowerCase()) > -1) memo.push(id);
        console.log('searching for ', searchPhrase);
      }
      return memo;
    }, container.foundIndexes)
      .with(container.searchPhrase)
      .init();
  });

  return b.container;
};
