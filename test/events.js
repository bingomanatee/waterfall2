
const EVENTS = 'add,delete,remove,update,change,replace,splice,batch'.split(',');
export default (data) => {
  const events = {
    other: [],
  };

  EVENTS.forEach((event) => {
    const coll = `${event}s`;
    events[coll] = [];
    data.on(event, c => events[coll].push(c));
  });

  data.on('change-other', change => events.other.push(change));

  return events;
};
