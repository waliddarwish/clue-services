set verify off 

grant create session, 
      create table, 
      create sequence, 
      create view, 
      create procedure
  to co 
  identified by "&co_password";
  
alter user co default tablespace users
              quota unlimited on users;

alter user co temporary tablespace temp;