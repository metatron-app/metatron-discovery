
<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" alt="metatron-discovery-logo" width="400px">

How to Compile BigQuery JDBC Plugin
==================================
Step 1. Download the JDBC driver from the link below.
----------------------------------
As of writing the guide, the JdbcDriver version is 1.2.11.1014.

Web Page : https://cloud.google.com/bigquery/providers/simba-drivers

Archived JDBC Driver Link in Page : https://storage.googleapis.com/simba-bq-release/jdbc/SimbaJDBCDriverforGoogleBigQuery42_1.2.11.1014.zip


Step 2. After uncompressing the downloaded zip file, copy it under bigquery-connection/src/main/resources/lib.
----------------------------------
```
cp SimbaJDBCDriverforGoogleBigQuery42_1.2.11.1014/* metatron-discovery/discovery-extensions/bigquery-connection/src/main/resources/lib/
``` 


Step 3. Execute maven build.
----------------------------------
```
mvn -P extensions-all clean install
``` 
