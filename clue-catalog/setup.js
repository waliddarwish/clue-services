


db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'mongo-admin' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'mongo-root' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'clue-owner' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'catalog-owner' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'logs-owner' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'tasks-owner' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'global-owner' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'agenda-owner' });
db.getSiblingDB('admin').getCollection('system.users').deleteOne({ user: 'document-owner' });


sleep(1000);

db.getSiblingDB("admin").createUser({
  user: 'mongo-admin',
  pwd: '4l$ahar',
  roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }],
});


db.getSiblingDB('admin').createUser({
  user: 'mongo-root',
  pwd: '4l30bo0r',
  roles: [{ role: 'root', db: 'admin' }],
});

db.getSiblingDB('admin').createUser({
  user: 'clue-owner',
  pwd: '4lzahraa2',
  roles: [
    { role: 'dbOwner', db: 'catalog' },
    { role: 'dbOwner', db: 'logs' },
    { role: 'dbOwner', db: 'global' },
    { role: 'dbOwner', db: 'tasks' },
    { role: 'dbOwner', db: 'agenda' },
    { role: 'dbOwner', db: 'documents' },
  ],
});

db.getSiblingDB('catalog').createUser({
  user: 'catalog-owner',
  pwd: '4lzahraa2',
  roles: [{ role: 'dbOwner', db: 'catalog' }],
});



db.getSiblingDB('logs').createUser({
  user: 'logs-owner',
  pwd: '4lzahraa2',
  roles: [{ role: 'dbOwner', db: 'logs' }],
});

db.getSiblingDB('global').createUser({
  user: 'global-owner',
  pwd: '4lzahraa2',
  roles: [{ role: 'dbOwner', db: 'global' }],
});


db.getSiblingDB('tasks').createUser({
  user: 'tasks-owner',
  pwd: '4lzahraa2',
  roles: [{ role: 'dbOwner', db: 'tasks' }],
});

db.getSiblingDB('agenda').createUser({
  user: 'agenda-owner',
  pwd: '4lzahraa2',
  roles: [{ role: 'dbOwner', db: 'agenda' }],
});

db.getSiblingDB('documents').createUser({
  user: 'document-owner',
  pwd: '4lzahraa2',
  roles: [{ role: 'dbOwner', db: 'documents' }],
});



