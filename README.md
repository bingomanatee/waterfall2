Waterfall is a basic rules system. It uses Mobx and events to create a set of linked datasources to process data 
from one bucket to another.

Each Data instance reacts to change of its data, emitting messages that contain the 
data changes. Data instances can observe changes to Arrays, Objects, Maps and single values
to trigger post-processing of data into other Data instances.

In some scenarios, Waterfall can be very economical about what is updating. If for instance,
you connect one Data instance with another using Map, then change one record of the first 
Data instance, it won't recompute for the other collection members. 

## WORK IN PROGRESS

Waterfall is a rebuild and refactor of an earlier version. Better examples and documentation
is pending. 
