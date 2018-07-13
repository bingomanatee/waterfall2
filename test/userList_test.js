import _ from 'lodash';

import users from './userList/tenThousandUsers';

import userListFactory from './userList/userList';
import bottle from '../src/bottle';
import eventsFn from './events';

const sortedUsers = _.sortBy(users, 'lastName', 'firstName', 'id');


describe('types', () => {
  let c;
  let userList;

  beforeEach(() => {
    const b = bottle();
    c = b.container;
    userList = userListFactory();
  });

  describe('sort by id', () => {
    it('should produce sorted ids', () => {
      userList.users.replace(users);
      const filter = userList.usersToSortedIDs;
      expect(userList.sortedUserIDs.raw())
        .toEqual(_.map(sortedUsers, 'id'));
    });

    it('should reflect updates to list', () => {
      const copy = users.slice(0);
      let prTime = Date.now();
      const firstSortedID = sortedUsers[0].id;
      const first = _.cloneDeep(copy[firstSortedID]);
      first.lastName = 'Zachary';
      copy[firstSortedID] = first;
      const resortedUserIDs = _(copy).sortBy('lastName', 'firstName', 'id')
        .map('id').value();
      let time = Date.now();
      console.log('manual time: ', time - prTime);
      userList.users.replace(users);
      console.log('time to assert data: ', Date.now() - time);
    //  console.log('users: ', userList.users.content.slice(0, 4));
      const filter = userList.usersToSortedIDs;
      userList.users.set(firstSortedID, first);
      let done = Date.now();
      console.log('took', done - time);
      expect(userList.sortedUserIDs.slice(0))
        .toEqual(resortedUserIDs);
    });
  });
});