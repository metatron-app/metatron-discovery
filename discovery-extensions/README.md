<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" alt="metatron-discovery-logo" width="400px">

How to make an extended connection
==================================


Step 1. create an extension module
----------------------------------

### 1. Navigate to the directory of the discovery-extensions module.
```
metatron-discovery $ cd discovery-extensions
```

### 2. Create an extension module using archetype.
```
discovery-extensions $ mvn archetype:generate -DarchetypeGroupId=app.metatron.discovery -DarchetypeArtifactId=discovery-extension-connection-archetype -DarchetypeVersion=1.0.0
```

### 3. In interactive mode, enter the desired value.
```
$ mvn archetype:generate -DarchetypeGroupId=app.metatron.discovery -DarchetypeArtifactId=discovery-extension-connection-archetype -DarchetypeVersion=1.0.0
[INFO] Scanning for projects...
[WARNING] 
[WARNING] Some problems were encountered while building the effective model for app.metatron.discovery:discovery-extensions:pom:3.2.0
[WARNING] 'build.plugins.plugin.version' for org.apache.maven.plugins:maven-compiler-plugin is missing. @ app.metatron.discovery:metatron-discovery:3.2.0, /../metatron-discovery/pom.xml, line 105, column 21
[WARNING] 
[WARNING] It is highly recommended to fix these problems because they threaten the stability of your build.
[WARNING] 
[WARNING] For this reason, future Maven versions might no longer support building such malformed projects.
[WARNING] 
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] Building discovery-extensions 3.2.0
[INFO] ------------------------------------------------------------------------
[INFO] 
[INFO] >>> maven-archetype-plugin:3.0.1:generate (default-cli) > generate-sources @ discovery-extensions >>>
[INFO] 
[INFO] <<< maven-archetype-plugin:3.0.1:generate (default-cli) < generate-sources @ discovery-extensions <<<
[INFO] 
[INFO] 
[INFO] --- maven-archetype-plugin:3.0.1:generate (default-cli) @ discovery-extensions ---
[INFO] Generating project in Interactive mode
[INFO] Archetype repository not defined. Using the one from [app.metatron.discovery:discovery-extension-connection-archetype:1.0.0] found in catalog local
Define value for property 'groupId': app.metatron.discovery 
Define value for property 'artifactId': custom-connection      
Define value for property 'version' 1.0-SNAPSHOT: : 1.0.0-7.3.0
Define value for property 'package' app.metatron.discovery: : 
Confirm properties configuration:
groupId: app.metatron.discovery
artifactId: custom-connection
version: 1.0.0-7.3.0
package: app.metatron.discovery
 Y: : Y
```



### 4. An extension module has been created with the following parameters.
```
[INFO] ----------------------------------------------------------------------------
[INFO] Using following parameters for creating project from Archetype: discovery-extension-connection-archetype:1.0.0
[INFO] ----------------------------------------------------------------------------
[INFO] Parameter: groupId, Value: app.metatron.discovery
[INFO] Parameter: artifactId, Value: custom-connection
[INFO] Parameter: version, Value: 1.0.0-7.3.0
[INFO] Parameter: package, Value: app.metatron.discovery
[INFO] Parameter: packageInPathFormat, Value: app/metatron/discovery
[INFO] Parameter: package, Value: app.metatron.discovery
[INFO] Parameter: version, Value: 1.0.0-7.3.0
[INFO] Parameter: groupId, Value: app.metatron.discovery
[INFO] Parameter: artifactId, Value: custom-connection
[INFO] Parent element not overwritten in /../metatron-discovery/discovery-extensions/custom-connection/pom.xml
[INFO] Project created from Archetype in dir: /../metatron-discovery/discovery-extensions/custom-connection
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### 5. Created module structure
```
custom-connection $ tree
.
├── pom.xml
└── src
    └── main
        ├── assembly
        │   └── assembly.xml
        ├── java
        │   └── app
        │       └── metatron
        │           └── discovery
        │               └── WelcomeConnectionExtension.java
        └── resources

```

Step 2. Customize extension
---------------------------------------
Let's create an extension named custom-connection. This extension adds MS-SQL jdbc connection.

### 1. Open and modify the created pom.xml.
- In the parent.version property, type metatron-discovery version (ex: 3.2.0)
```
<parent>
    <artifactId>discovery-extensions</artifactId>
    <groupId>app.metatron.discovery</groupId>
    <version>3.2.0</version>
</parent>
```

- Change the properties as desired.
change plugin.id, plugin.class property as desired.
Please refer to the sample below.
```
<properties>
    <project.distribution.path>${basedir}/../../discovery-distribution</project.distribution.path>
    
    <!-- extension id-->
    <plugin.id>custom-connection-extension</plugin.id>
    
    <!-- extension Class -->
    <plugin.class>app.metatron.discovery.CustomConnectionExtension</plugin.class>
    
    <!-- extension version -->
    <plugin.version>1.0.0</plugin.version>
    
    <plugin.provider></plugin.provider>
    <plugin.dependency></plugin.dependency>
</properties>
```

- Add the desired JDBC Driver as dependency
```
<dependencies>
    <dependency>
        <groupId>com.microsoft.sqlserver</groupId>
        <artifactId>mssql-jdbc</artifactId>
        <version>7.3.0.jre8-preview</version>
    </dependency>
</dependencies>
```

### 2. Rename Extension Class
Modify the name of the WelcomeConnectionExtension class as desired.
(ex : CustomConnectionExtension.java)

### 3. Override methods of JdbcDialect interface that require modification.
- Override methods of JdbcDialect interface that require modification.
```
@Override
public String getName() {
  return "MS-SQL";
}

@Override
public String getImplementor() {
  return "MSSQL";
}

@Override
public InputSpec getInputSpec() {
  return (new InputSpec())
      .setAuthenticationType(InputMandatory.MANDATORY)
      .setUsername(InputMandatory.MANDATORY)
      .setPassword(InputMandatory.MANDATORY)
      .setCatalog(InputMandatory.NONE)
      .setSid(InputMandatory.NONE)
      .setDatabase(InputMandatory.MANDATORY);
}

@Override
public String getDriverClass(JdbcConnectInformation connectInfo) {
  return "com.microsoft.sqlserver.jdbc.SQLServerDriver";
}

@Override
public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
  return "app.metatron.discovery.CustomConnectionExtension$WelcomeDataAccessor";
}

@Override
public String makeConnectUrl(JdbcConnectInformation connectInfo, String database, boolean includeDatabase) {
  if(StringUtils.isNotEmpty(connectInfo.getUrl())) {
    return connectInfo.getUrl();
  }

  StringBuilder builder = new StringBuilder();
  builder.append("jdbc:sqlserver:/");

  // Set HostName
  builder.append(URL_SEP);
  builder.append(connectInfo.getHostname());

  // Set Port
  if(connectInfo.getPort() != null) {
    builder.append(":").append(connectInfo.getPort());
  }

  // Set DataBase
  if(StringUtils.isNotEmpty(connectInfo.getDatabase()) && includeDatabase) {
    builder.append(";");
    builder.append("database=");
    builder.append(connectInfo.getDatabase());
  }

  return builder.toString();
}
```

### 4. Build extension module
```
discovery-extensions $ mvn clean install
```

### 5. extension output created at discovery-distribution/extensions directory
```
metatron-discovery $ ls -al discovery-distribution/extensions/
drwxr-xr-x   3 staff  staff    96B Apr 15 15:23 ./
drwxr-xr-x  10 staff  staff   320B Apr 15 15:23 ../
-rw-r--r--   1 staff  staff   3.6M Apr 15 15:23 custom-connection-1.0.0-7.3.0.zip
```


Step 3. Exploit extended connection in Metatron Discovery
---------------------------------------

### 1. Config extension path
Basically, use Metatron-Discovery's ApplicationHome subdirectory "extension" as the extension path.
To explicitly specify the extension path, you can add the following options:
```
-Dpf4j.pluginsDir=<extension path>
```

### 2. Enable / disable extension
You can enable or disable the extension when you start Metatron Discovery.
Open application.yaml and add the following:
```
polaris:
  extensions: 
    plugin-enable:
      - <plugin-id>
      - <plugin-id>
      - ...
    plugin-disable:
      - <plugin-id>
      - <plugin-id>
      - ...
```
If not set, activate all extension of extension path.

### 3. maven profile related to distribution constraints
We do not build all extensions by default because there are extensions that are restricted by some distribution licenses.
To build the entire extension you need to build it using the 'extensions-all' profile.
```
mvn -P extensions-all clean install
``` 