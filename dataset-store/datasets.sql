drop database if exists datasets cascade;

create database datasets;

CREATE USER IF NOT EXISTS dsuser;

GRANT ALL ON DATABASE datasets TO dsuser;

use datasets;
