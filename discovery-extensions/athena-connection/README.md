
<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" alt="metatron-discovery-logo" width="400px">

Athena Connection Extension
==================================
Connection Extension for AWS Athena with JDBC.

The Athena JDBC Driver version used is 2.0.2.

For more information, refer to the JDBC Driver Documentation section of the page below.

https://docs.aws.amazon.com/athena/latest/ug/connect-with-jdbc.html


How to connect Athena via JDBC
==================================
How to Connect to Athena from Discovery with the Athena Connection Extension.

There are various ways to configure connection URL.

See the following page for a detailed configure guide.

https://s3.amazonaws.com/athena-downloads/drivers/JDBC/SimbaAthenaJDBC_2.0.2/docs/Simba+Athena+JDBC+Driver+Install+and+Configuration+Guide.pdf

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
