--------------------------------------------------------------------------------------
-- Name	       : OT (Oracle Tutorial) Sample Database
-- Link	       : http://www.oracletutorial.com/oracle-sample-database/
-- Version     : 1.0
-- Last Updated: July-28-2017
-- Copyright   : Copyright � 2017 by www.oracletutorial.com. All Rights Reserved.
-- Notice      : Use this sample database for the educational purpose only.
--               Credit the site oracletutorial.com explitly in your materials that
--               use this sample database.
--------------------------------------------------------------------------------------
--------------------------------------------------------------------
-- execute the following statements to create a user name OT and
-- grant priviledges
--------------------------------------------------------------------

-- create new user

ALTER SESSION SET CONTAINER=SAMPLES;

CREATE TABLESPACE USERS DATAFILE '/u02/app/oracle/oradata/SAMPLES/pdbseed/Users01.dbf' SIZE 1G;


CREATE USER OTUSER IDENTIFIED BY Oradoc_db1 default tablespace users temporary tablespace temp;


-- grant priviledges
GRANT CONNECT, RESOURCE, DBA TO OTUSER;

exit
