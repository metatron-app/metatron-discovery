
<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" alt="metatron-discovery-logo" width="400px">

Configure Oracle maven Dependencies
==================================
Additional configuration is required to build the oracle connection extension.

The oracle jdbc driver does not exist in the public repository.

You must do one of the two following methods.

Method 1. Setting up oracle maven repository security
----------------------------------
Please refer to the step by step guide in the link below to build the maven security configuration.

https://blogs.oracle.com/dev2dev/get-oracle-jdbc-drivers-and-ucp-from-oracle-maven-repository-without-ides


Method 2. Adding a jar file to the local maven repository
----------------------------------
Download from Oracle Technology Network (registration is required) and then install the downloaded jars into your local Maven repository.

Download the ojdbc8.jar file from the link below. (oracle homepage registration required)

https://www.oracle.com/technetwork/database/features/jdbc/jdbc-ucp-122-3110062.html

Then, install it using the command:
```
mvn install:install-file -DgroupId=com.oracle.jdbc -DartifactId=ojdbc8 -Dversion=18.3.0.0 -Dpackaging=jar -Dfile=/downloaded/path/ojdbc8.jar
```


maven profile related to distribution constraints
=================================================
We do not build all extensions by default because there are extensions that are restricted by some distribution licenses.

To build the entire extension you need to build it using the 'include-all' profile.
```
mvn -P extensions-all clean install
``` 