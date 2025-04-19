

/usr/bin/mongoimport --username catalog-owner --password 4lzahraa2 --host localhost --port 27017 --db catalog --collection=tenants --file=/etc/clue-catalog/static-data/admin-tenant.json --verbose --jsonArray  --numInsertionWorkers=4 
/usr/bin/mongoimport --username catalog-owner --password 4lzahraa2 --host localhost --port 27017 --db catalog --collection=users --file=/etc/clue-catalog/static-data/admin-user.json --verbose --jsonArray  --numInsertionWorkers=4



# Language support
/usr/bin/mongoimport --username global-owner --password 4lzahraa2 --host localhost --port 27017 --db global --collection=global --file=/etc/clue-catalog/static-data/global-en.json --verbose --jsonArray    --numInsertionWorkers=4 

#load Plans
/usr/bin/mongoimport --username catalog-owner --password 4lzahraa2 --host localhost --port 27017 --db catalog --collection=subscriptionplans --file=/etc/clue-catalog/static-data/plans.json --verbose --jsonArray    --numInsertionWorkers=4 
