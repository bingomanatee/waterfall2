import _ from 'lodash';

import users from './userList/tenThousandUsers';

import userListFactory from './userList/userList';
import bottle from '../src/bottle';
import eventsFn from './events';

const sortedUsers = _.sortBy(users, 'lastName', 'firstName', 'email', 'id');
// require('fs').writeFileSync('tenThousandUsersSorted.json', JSON.stringify(sortedUsers));

describe('types', () => {
  let c;
  let userList;

  beforeEach(() => {
    const b = bottle();
    c = b.container;
    userList = userListFactory();
  });

  describe('sort by id', () => {
    beforeEach(() => {
      userList.users.replace(users);
      const filter = userList.usersToSortedIDs;
    });

    it('should produce sorted ids', () => {
      expect(userList.sortedUserIDs.raw())
        .toEqual(_.map(sortedUsers, 'id'));
    });

    it('should reflect updates to list', () => {
      const copy = users.slice(0);
      const firstSortedID = sortedUsers[0].id;
      const first = _.cloneDeep(sortedUsers[0]);
      first.lastName = 'Zachary';
      copy[first.id] = first;
      const resortedUserIDs = _(copy)
        .sortBy('lastName', 'firstName', 'email', 'id')
        .map('id')
        .value();
      userList.users.set(first.id, first);
      expect(userList.sortedUserIDs.slice(0))
        .toEqual(resortedUserIDs);
    });
  });

  describe('search indexing', () => {
    beforeEach(() => {
      userList.users.replace(users);
      const sorted = userList.usersToByID;
      const filter = userList.usersToSearchTerms;
    });

    it('should produce an index of search terms', () => {
      expect(userList.searchTerms.get(0)).toEqual('donald\tyoung\tsxoodez@ydmnvxmyodagnclx.com');
      expect(userList.searchTerms.get(9999)).toEqual('margaret\tanderson\timjhk@sjxgohx.com');
    });
  });

  describe('searching', () => {
    let events;
    beforeEach(() => {
      userList.users.replace(users);
      const index = userList.usersToByID;
      const sort = userList.usersToSortedIDs;
      const terms = userList.usersToSearchTerms;
      const filter = userList.searchToFoundIndexes;
    });

    it('should start with all the indexes', () => {
      expect(userList.foundIndexes.length).toEqual(10000);
    });

    it('should find a smaller set when set', () => {
      events = eventsFn(userList.foundIndexes);
      userList.searchPhrase.replace('phi');
      expect(userList.foundIndexes.content)
        .toEqual([2212, 3675, 5641, 6075, 7641, 9039, 9288, 9323, 9423, 9783, 9992]);
      userList.foundIndexes.content.forEach((index) => {
        const term = userList.searchTerms.get(index);
        expect(term.indexOf('phi')).toBeGreaterThan(-1);
      });
    });
  });

  describe('chunking', () => {
    let events;
    beforeEach(() => {
      userList.users.replace(users);
      const index = userList.usersToByID;
      const sort = userList.usersToSortedIDs;
      const terms = userList.usersToSearchTerms;
      const filter = userList.searchToFoundIndexes;
      const chunking = userList.foundIndexesToChunks;
      const sortChunks = userList.sortFoundIndexes;
      const sortChunking = userList.sortedFoundIndexes;
    });

    it.skip('should report: ', () => {
      console.log('==== CHUNKING REPORT ====');
      console.log(userList.report(10));
      expect(1).toEqual(1);
    });

    it('should start chunking', () => {
      expect(userList.chunkedIDs.get(0))
        .toEqual([4137, 7972, 4947, 5834, 3173, 7640, 6698, 4319, 8427, 1406]);
    });

    it('should resize when the pageSize changes', () => {
      userList.pageSize.replace(5);
      // console.log(' ------------------ should resize when changed: -------------------');
      // console.log(userList.report(4, 100));
      expect(userList.chunkedIDs.get(0))
        .toEqual([4137, 7972, 4947, 5834, 3173]);
    });

    it('should find a smaller set when set', async () => {
      userList.searchPhrase.replace('phi');

      expect(userList.chunkedIDs.get(0))
        .toEqual([9423, 3675, 9039, 9992, 9288, 9323, 2212, 6075, 7641, 5641]);
    });
  });

  describe('final unification', () => {
    beforeEach(() => {
      userList.users.replace(users);
      const index = userList.usersToByID;
      const sort = userList.usersToSortedIDs;
      const terms = userList.usersToSearchTerms;
      const filter = userList.searchToFoundIndexes;
      const chunking = userList.foundIndexesToChunks;
      const sortChunks = userList.sortFoundIndexes;
      const sortChunking = userList.sortedFoundIndexes;
      const final = userList.chunksToUsers;
    });

    it.skip('should report', () => {
      console.log('==== FINALUSERS REPORT ====');
      console.log(userList.report(10));
    });

    it('should put users in finalUsers (ids) ', () => {
      const finalUsersMail = userList.finalUsers.map(user => user.id);
      expect(finalUsersMail).toEqual(sortedUsers.slice(0, 10).map(user => user.id));
    });

    it('should put users in finalUsers (emails)', () => {
      const finalUsersMail = userList.finalUsers.map(user => user.email);
      expect(finalUsersMail).toEqual(sortedUsers.slice(0, 10).map(user => user.email));
    });
  });
});
