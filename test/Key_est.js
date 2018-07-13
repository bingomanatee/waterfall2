import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('Key', () => {
    let dataArray;
    let dataMap;
    beforeEach(() => {
      dataArray = c.toData([
        { id: 1, name: 'bob', age: 3 },
        { id: 2, name: 'al', age: 4 },
        { id: 5, name: 'sue', age: 10 },
      ], 'someItems');
      dataMap = c.toData(new Map());
      dataArray.key(item => item.id, dataMap).init();
    });

    it('should have users by ID', () => {
      expect(dataMap.get(2).name).toEqual('al');
      expect(dataMap.get(5).name).toEqual('sue');
    });

    it('should update content', () => {
      dataArray.splice(1, 1, { id: 2, name: 'albert' });
      expect(dataMap.get(2).name).toEqual('albert');
      expect(dataMap.get(5).name).toEqual('sue');
    });
    it('should add content', () => {
      dataArray.push({ id: 10, name: 'dave' });
      expect(dataMap.get(10).name).toEqual('dave');
    });
  });
});
