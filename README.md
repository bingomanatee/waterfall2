Waterfall is a basic rules system. It uses events to create a set of linked datasources to process data 
from one bucket to another.

Each Data instance reacts to change of its data, emitting messages that contain the 
data changes. Data instances can observe changes to Arrays, Objects, Maps and single values
to trigger post-processing of data into other Data instances.

In some scenarios, Waterfall can be very economical about what is updating. If for instance,
you connect one Data instance with another using Map, then change one record of the first 
Data instance, it won't recompute for the other collection members. 

## Best Use Cases 

The best use cases for Waterfall is where a significant amount of data passes through a series of processes
and varies based on different changeable parameters. A classic one (see tests) is a large list that is 
sorted, paginated, filtered by search and potentially other characteristics. The end result of a large 
number of operations over a large data set can be tricky and expensive, and you may recompute overmuch
based on the change that really only requires a recalculation of a subset of the data. 

With Waterfall, you can bridge one state to another with maps, reductions, filters or keying modifiers
that transform data from one Data to another. You can observe data in each sub-state and build 
systems up from sub-transactions so that you can isolate and test each stage of the transaction 
until you have a network of data and change that produces the desired outcome. 

Each Data is an emitter, so you can listen to change to one or more parts of the network as it resolves
activity. 

## A simple example

Say you have a set of pets with age, gender, and name. 

````

const pets = waterfall.toData([
  {
    "name": "Bailee",
    "age": 22,
    "gender": "M"
  },
  {
    "name": "Lenora",
    "age": 16,
    "gender": "M"
  },
  {
    "name": "Zola",
    "age": 15,
    "gender": "M"
  },
  {
    "name": "Ross",
    "age": 12,
    "gender": "F"
  },
  {
    "name": "Chelsea",
    "age": 16,
    "gender": "M"
  },
], 'users');

````

You want to compute the oldest, oldest woman, and oldest man. 

````
// save a list of the oldest of all
malePets = waterfall.toData([], 'malePets'));
femalePets = waterfall.toData([], 'femalePets'));

// split the base collection into genders

pets.filterTo(pets => pets.filter(pet => pet.gender === 'M'))
  .into(container.malePets).init();
pets.filterTo(pets => pets.filter(pet => pet.gender === 'F'))
  .into(container.femalePets).init();

// now filter each data set into a Data instance for the oldest of a series

oldestPets = waterfall.toData([], 'oldestPets'));
oldestMalePets = waterfall.toData([], 'oldestMalePets'));
oldestFemalePets = waterfall.toData([], 'oldestFemalePets'));

const reduceOldest = (oldest, pet) => {
                         if (!oldest.length) return [pet];
                         if (pet.age > oldest[0].age) return [pet];
                         if (pet.age === oldest[0].age) return oldest.concat([pet]);
                         return oldest;
                       }

pets.reduceTo(oldestReduer, oldestPets).init();
malePets.reduceTo(oldestReduer, oldestMalePets).init();
femalePets.reduceTo(oldestReduer, oldestFemalePets).init();

oldestPets.on('change', () => console.log('oldest pets are', oldestData.raw());
oldestMalePets.on('change', () => console.log('oldest men are', oldestMen.raw());

````

now, if you push a man into the set

```
pets.push({name: 'oldy mcOldface', age: 100, gender: 'M'),

```

you will get a change notice. Similarly if you push young pets in, you won't get
update events from either of the oldest Data items. 

## Synchronicity and Transactions

All change in this system is synchronous. If you want to integrate promises into 
this system, you can do so externally. It may help to use transactions. 

A transaction is Data collection centric. Once you call `.transStart()` on a collection,
all changes are kept as pending in a Transaction object and sent as a batch to the 
Data object when you call `.transEnd()` on it. So, you can start a transaction, 
call one or a series of promises that modify a Data collection, then when it/they
resolve, call `.transEnd()` on that collection. 

## Creating chains of modifiers

You can chain Data collections to each other using modifiers.
When the "from" Data changes, the modifier will update the target. 

Modifiers take one or more arguments:

* **a transforming function** (required) that transforms the "from" collection 
  (or elements of the "from" collection) into the target
* **a target** -- the collection that the results are put into
* **withData** -- an array of any related collections that are watched for changes
  and assist in the computation of the transformation

there are also currying methods like

* `with(Data)` and `.withData([Data, Data])` adds related collections
* `into(Data)` sets the target

### the `.init()` trigger

Modifiers don't activate until you call `.init()` on them. 
This is to allow time for currying methods to add any needed input
to the modifier. 

### withs

Sometimes you want to watch and incorporate related data. A classic 
example is when you want to watch for a change in the page in a 
pagination reducer, or a search term in a search reducer. 

Withs are passed 

### mapTo

ToMap takes a function that copies the modified value fromm the original 
and maps it to the same key of the target. 

The toMap function operates on individual key/value pairs; if you change single
values in the from Data, only single values in the target are updated.

The transforming function has the signature 

```` javascript

(value, key, {withs}) => newValue

````

### reduceTo

ReduceTo modifiers recalculate an output value over the from collection
whenever anything changes. It operates like the array's reduce method
but can reduce from maps or objects as well. 

The transform function has the following signature.

```` javascript

(memo, value, key, {withs}) => newMemo

````

The memo is initialized with a blank version of however the target data is stored
and replaces the target when all from values are computed into it. 

it is applied to Array and Map values in order; ordering of Object keys/values
is not guaranteed. 

### filterTo

FilterTo takes the entire from data and transforms it into a value that
replaces the target collection. 

The transform function has the following signature.

```` javascript

(from, {withs}) => newMemo

````

(From in this context is the raw data stored in the from Data collection --
an Array, Map, Object.)

### keyTo

KeyTo stores the values (untransformed) of the From Data in keys
provided by the transform function into the target. Useful for indexing items
by ID. 

The key transform function's signature is 

```` javascript

(value, key, {withs}) => newKey

````

## Modifying data and triggering updates

There is no "magic" observation of data; i.e., using array notation or 
modifying object properties or the .content Map or Array directly 
doesn't trigger changes. All changes are triggered 
either by resetting entire collections 
(`myData.collection = NewData` or `myData.replace(newData)`)
or by calling `myData.set(key, value)` to update single elements. 

There are separate Data subclasses that manage Objects, Maps, Arrays and single values. 
The DataArray class has several arrayLike methods - push, pop, splice, map. 

"non changes" -- setting values to identical items -- don't trigger changes.

As much as possible, change is limited, depending on the nature of the 
modifier that connects it to other Data. For instance, if you link one
collection to another using the mapTo method and change a single value,
only a single mapped element is recalculated. 

### Type enforcement

The Data collections are type-insulated; that is, each is built to contain
a specific data model (Map, Array, Object or value (scalar)). If you attempt
to replace its contents with a different type of data it will throw an error. 

## Reporting

If you are having issues with data not piping or expected or value state,
each Data collection has a `toTable()` method that produces a partial or
complete list of the Data collection as well as the incoming and outgoing
Modifiers related to it. 
