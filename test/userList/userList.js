import _ from 'lodash';
import Bottle from 'bottlejs';

import c from '../../src';

export default() => {
  const b = new Bottle();

  b.constant('users', c.toData([], 'users'));

  b.constant('usersByID', c.toData(new Map(), 'usersByID'));
  b.factory('usersToByID', con => con.users.key(user => user.id, con.usersByID).init());

  b.constant('sortedUserIDs', c.toData([], 'sortedUserIDs'));
  b.factory(
    'usersToSortedIDs',
    container => container.users.filterTo(
      userList => _(userList).sortBy('lastName', 'firstName', 'id').map('id').value(),
      container.sortedUserIDs,
    ).init(),
  );

  b.constant('searchTerms', c.toData(new Map(), 'searchTerms'));
  b.factory('usersToSearchTerms', container => container.usersByID.mapTo(
    (user) => {
      const { firstName, lastName, email } = user;
      const result = [firstName, lastName, email].join('\t').toLowerCase();
      return result;
    },
    container.searchTerms,
  ).init());

  b.constant('searchPhrase', c.toData('', 'searchPhrase'));
  b.constant('foundIndexes', c.toData([], 'foundIndexes'));

  b.factory('searchToFoundIndexes', (container) => {
    container.searchTerms.reduceTo((memo, term, id, change, { searchPhrase }) => {
      if (!searchPhrase) memo.push(id);
      else if (term.indexOf(searchPhrase.toLowerCase()) > -1) memo.push(id);
      return memo;
    }, container.foundIndexes)
      .with(container.searchPhrase)
      .init();
  });

  b.constant('page', c.toData(0, 'page'));
  b.constant('pageSize', c.toData(10, 'pageSize'));
  b.constant('chunkedIDs', c.toData([], 'chunkedIDs'));
  b.factory(
    'foundIndexesToChunks',
    con => con.foundIndexes.filterTo((ids, ch, { pageSize }) => _.chunk(ids, pageSize))
      .with(con.pageSize)
      .into(con.chunkedIDs)
      .init(),
  );

  return b.container;
};
