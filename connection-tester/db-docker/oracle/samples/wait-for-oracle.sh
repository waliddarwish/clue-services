
source /home/oracle/.bashrc

ORCLCDB=`sqlplus / as sysdba  @/u01/samples/checkdatabase.sql   | grep ORCLCDB`
until [[ "$ORCLCDB" == "ORCLCDB" ]]; do
    echo $ORCLCDB
    echo "Oracle is not up, Sleeping for 30 seconds and trying again ...";
    sleep 30
    ORCLCDB=`sqlplus / as sysdba  @/u01/samples/checkdatabase.sql   | grep ORCLCDB`
done


LINES=`cat /u01/app/oracle/product/12.2.0/dbhome_1/admin/ORCLCDB/tnsnames.ora | wc -l`

if [ "$LINES" -eq "2" ]; then 
    echo 'SAMPLES = (DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = localhost)(PORT = 1521)) (CONNECT_DATA = (SERVER = DEDICATED) (SERVICE_NAME = SAMPLES.localdomain) ))' >> /u01/app/oracle/product/12.2.0/dbhome_1/admin/ORCLCDB/tnsnames.ora
fi