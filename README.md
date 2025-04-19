#ClueAnalytics Services

### To build and run all services in dev mode:

- `make build-all`
- `make cluster-up`


### To clean all build artifacts

- `make clean-all`



### To clean your local databases

- `make clean-local-cluster-data`


### Steps to open the dev env in visual studio code

 1 - Install the following plugins

    - Docker Explorer 

    - Docker Workspace



2. Start the local cluster (at minimum, you should start the clueanalytics/dev-image service, you can achieve that by running "make cluster-up" or 
"make start-dev" )



3. From Docker explorer, right click on the dev-image container and choose "Attach visual studio code" from the menu. A new VSCode window will open. 

