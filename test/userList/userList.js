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
      userList => _(userList).sortBy('lastName', 'firstName', 'email', 'id').map('id').value(),
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
    container.searchTerms.reduceTo(
      (memo, term, id, change, { searchPhrase }) => {
        if (!searchPhrase) memo.push(id);
        else if (term.indexOf(searchPhrase) > -1) {
          memo.push(id);
        }
        return memo;
      },
      container.foundIndexes,
    )
      .with(container.searchPhrase)
      .init();
  });

  b.constant('sortedFoundIndexes', c.toData([], 'sortedFoundIndexes'));
  b.factory(
    'sortFoundIndexes',
    con => con.sortedUserIDs
      .filterTo((sIDs, change, { foundIndexes }) => _.intersection(sIDs, foundIndexes))
      .into(con.sortedFoundIndexes)
      .with(con.foundIndexes)
      .init(),
  );

  b.constant('page', c.toData(0, 'page'));
  b.constant('pageSize', c.toData(10, 'pageSize'));
  b.constant('chunkedIDs', c.toData([], 'chunkedIDs'));
  b.factory(
    'foundIndexesToChunks',
    con => con.sortedFoundIndexes
      .filterTo((ids, ch, { pageSize }) => _.chunk(ids, pageSize))
      .with(con.pageSize)
      .into(con.chunkedIDs)
      .init(),
  );

  b.constant('finalUsers', c.toData([], 'finalUsers'));
  b.factory('chunksToUsers', con => con.chunkedIDs
    .filterTo((chunks, change, { page, usersByID }) => {
      const chunk = chunks[page];
      if (!chunk) return [];
      return chunk.map(id => usersByID.get(id));
    }).with(con.usersByID)
    .with(con.page)
    .into(con.finalUsers)
    .init());

  const chunkedIDRenderer = list => `[${list.join(', ')}]`;
  const userRenderer = user => (!user ? '(none)' : `${user.firstName} ${user.lastName} ${user.email}`);
  b.factory('report', con => (maxItems, maxFound = 0) => {
    const out = [
      con.users.toTable({
        isHorizontal: false,
        maxItems,
        cellRenderer: userRenderer,
      }),
      con.usersByID.toTable({
        isHorizontal: false,
        maxItems,
        cellRenderer: userRenderer,
      }),
      con.sortedUserIDs.toTable({
        isHorizontal: true,
        maxItems,
      }),
      con.searchTerms.toTable({
        isHorizontal: false,
        maxItems,
      }),
      con.foundIndexes.toTable({
        isHorizontal: true,
        maxItems: Math.max(maxFound, maxItems),
      }),
      con.sortedFoundIndexes.toTable({
        isHorizontal: true,
        maxItems: Math.max(maxFound, maxItems),
      }),

      con.chunkedIDs.toTable({
        isHorizontal: false,
        cellRenderer: chunkedIDRenderer,
        maxItems,
      }),

      con.pageSize.toTable(),
      con.page.toTable(),
      con.searchPhrase.toTable(),
    ];

    return out.join('\n');
  });
  return b.container;
};
