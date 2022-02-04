
<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" alt="metatron-discovery-logo" width="400px">

Athena Connection Extension
==================================
Connection Extension for AWS Athena with JDBC.

For more information, refer to the JDBC Driver Documentation section of the page below.

https://docs.aws.amazon.com/athena/latest/ug/connect-with-jdbc.html


How to Compile Athena JDBC Plugin
==================================
Step 1. Download the JDBC driver from the link below.
----------------------------------
As of writing the guide, the JdbcDriver version is 2.0.27.

Web Page : https://docs.aws.amazon.com/athena/latest/ug/connect-with-jdbc.html

Archived JDBC Driver Link in Page : https://s3.amazonaws.com/athena-downloads/drivers/JDBC/SimbaAthenaJDBC-2.0.27.1000/AthenaJDBC42_2.0.27.1000.jar


Step 2. copy it under athena-connection/src/main/resources/lib.
----------------------------------
```
cp AthenaJDBC42_2.0.27.1000.jar metatron-discovery/discovery-extensions/athena-connection/src/main/resources/lib/
``` 

Step 3. Execute maven build.
----------------------------------
```
mvn -P extensions-all clean install
``` 


How to connect Athena via JDBC
==================================
How to Connect to Athena from Discovery with the Athena Connection Extension.

There are various ways to configure connection URL.

See the following page for a detailed configure guide.

https://s3.amazonaws.com/athena-downloads/drivers/JDBC/SimbaAthenaJDBC-2.0.27.1000/doc/Simba+Athena+JDBC+Connector+Install+and+Configuration+Guide.pdf

Sample using endpoint URL can be configured as below.


Endpoint URL format
----------------------------------
```
jdbc:awsathena://athena.[Region].amazonaws.com:443;User=
[AccessKey];Password=[SecretKey];S3OutputLocation=[Output];
[Property1]=[Value1];[Property2]=[Value2];...
```

Athena connection input Sample
----------------------------------
Additional properties can be delivered through custom properties.
<kbd><img title="Metatron-dashboard" src="https://user-images.githubusercontent.com/3770446/72580050-2faeac00-391e-11ea-93cc-9d0422537bc0.png"></kbd><br />
