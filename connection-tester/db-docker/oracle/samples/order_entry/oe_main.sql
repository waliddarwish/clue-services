rem
rem Header: oe_main.sql 2015/03/19 10:23:26 smtaylor EXP $
rem
rem Copyright (c) 2001, 2015, Oracle and/or its affiliates.  All rights reserved. 
rem 
rem Permission is hereby granted, free of charge, to any person obtaining
rem a copy of this software and associated documentation files (the
rem "Software"), to deal in the Software without restriction, including
rem without limitation the rights to use, copy, modify, merge, publish,
rem distribute, sublicense, and/or sell copies of the Software, and to
rem permit persons to whom the Software is furnished to do so, subject to
rem the following conditions:
rem 
rem The above copyright notice and this permission notice shall be
rem included in all copies or substantial portions of the Software.
rem 
rem THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
rem EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
rem MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
rem NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
rem LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
rem OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
rem WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
rem
rem Owner  : ahunold
rem
rem NAME
rem   oe_main.sql - Main script for OE schema, including OC subschema 
rem
rem DESCRIPTON
rem   Creates and populated the Order Entry (OE) and Online
rem   Catalog (OC) Sample Schema
rem
rem NOTES
rem   Run as SYS or SYSTEM
rem   Prerequisites:
rem     Tablespaces present
rem     Database enabled for Spatial and XML
rem
rem MODIFIED   (MM/DD/YY)
rem   smtaylor  03/19/15 - added parameter 9, connect_string
rem   smtaylor  03/19/15 - added @&connect_string to CONNECT
rem   smtaylor  03/19/15 - added pararmeter &connect_string to script calls
rem   celsbern  08/13/12 - added create or replace for coe synonyms
rem   jmadduku  02/18/11 - Grant Unlimited Tablespace priv with RESOURCE
rem   pthornto  07/29/04 - 
rem   pthornto  07/16/04 - obsolete 'connect' role 
rem   ahunold   11/21/02 - bug 2635796
rem   ahunold   10/07/02 - passing more parameters to coe*.sql
rem   hyeh      08/29/02 - hyeh_mv_comschema_to_rdbms
rem   ahunold   08/15/02 - coe, loe,
rem   ahunold   07/29/02 - versioning comments
rem   ahunold   07/22/02 - typo
rem   ahunold   07/15/02 - versions
rem   ahunold   08/28/01 - roles
rem   ahunold   07/13/01 - NLS Territory.
rem   ahunold   04/13/01 - spool, additional parameter
rem   ahunold   03/29/01 - spool
rem   ahunold   03/12/01 - prompts
rem   ahunold   03/02/01 - NLS_LANGUAGE
rem   ahunold   01/09/01 - checkin ADE

SET ECHO OFF


PROMPT writeable directory path for the log files as parameter 7:
DEFINE log_path = /u01/log
PROMPT
PROMPT specify version as parameter 8:
DEFINE vrs = v3
PROMPT


-- The first dot in the spool command below is 
-- the SQL*Plus concatenation character

DEFINE spool_file = &log_path.oe_oc_v3..log
SPOOL &spool_file

-- Dropping the user with all its objects

DROP USER oe CASCADE;

REM =======================================================
REM create user
REM 
REM The user is assigned tablespaces and quota in separate
REM ALTER USER statements so that the CREATE USER statement
REM will succeed even if the demo and temp tablespaces do
REM not exist.
REM =======================================================

CREATE USER oe IDENTIFIED BY Oradoc_db1;

ALTER USER oe DEFAULT TABLESPACE users QUOTA UNLIMITED ON users;

ALTER USER oe TEMPORARY TABLESPACE temp;

GRANT CREATE SESSION, CREATE SYNONYM, CREATE VIEW TO oe;
GRANT CREATE DATABASE LINK, ALTER SESSION TO oe;
GRANT RESOURCE , UNLIMITED TABLESPACE TO oe;
GRANT CREATE MATERIALIZED VIEW  TO oe;
GRANT QUERY REWRITE             TO oe;

REM =======================================================
REM grants from sys schema
REM =======================================================

CONNECT sys/Oradoc_db1@ORCLCDB AS SYSDBA;  
ALTER SESSION
SET CONTAINER
=SAMPLES;
GRANT execute ON sys.dbms_stats TO oe;

REM =======================================================
REM grants from hr schema
REM =======================================================

CONNECT hr/Oradoc_db1@SAMPLES
GRANT REFERENCES, SELECT ON employees TO oe;
GRANT REFERENCES, SELECT ON countries TO oe;
GRANT REFERENCES, SELECT ON locations TO oe;
GRANT SELECT ON jobs TO oe;
GRANT SELECT ON job_history TO oe;
GRANT SELECT ON departments TO oe;


REM =======================================================
REM create oe schema (order entry)
REM =======================================================

CONNECT oe/Oradoc_db1@SAMPLES
ALTER SESSION SET NLS_LANGUAGE=American;
ALTER SESSION SET NLS_TERRITORY=America;

--
-- call script to create OE objects
--

DEFINE vscript = /u01/samples/order_entry/coe_v3
@&vscript v3 Oradoc_db1 Oradoc_db1 SAMPLES

--
-- call script to load OE objects
--

DEFINE vscript = /u01/samples/order_entry/loe_v3
@&vscript Oradoc_db1 Oradoc_db1 SAMPLES

--
-- call script for post-load operations on OE
--

DEFINE vscript = /u01/samples/order_entry/poe_v3
@&vscript v3 

--
-- OC subschema
--

@/u01/samples/order_entry/oc_main

--
-- statistics
--

@/u01/samples/order_entry/oe_analz

-- oe_analz invalidates the coe public synonyms - recreate them
CONNECT sys/Oradoc_db1@ORCLCDB AS SYSDBA;  
ALTER SESSION
SET CONTAINER
=SAMPLES;
CREATE OR REPLACE PUBLIC SYNONYM COE_CONFIGURATION FOR COE_CONFIGURATION;
CREATE OR REPLACE PUBLIC SYNONYM COE_NAMESPACES FOR COE_NAMESPACES;
CREATE OR REPLACE PUBLIC SYNONYM COE_DOM_HELPER FOR COE_DOM_HELPER;
CREATE OR REPLACE PUBLIC SYNONYM COE_UTILITIES FOR COE_UTILITIES;
CREATE OR REPLACE PUBLIC SYNONYM COE_TOOLS FOR COE_TOOLS;

spool off
