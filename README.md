<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" alt="metatron-discovery-logo" width="400px">

**Metatron Discovery** is a end-to-end self-service solution for big data discovery.
To learn more about metatron discovery, visit our web site [https://metatron.app](https://metatron.app)

Strengths
------------------
1. Powered by [Apache Druid](http://druid.io/), metatron can process huge size of data super fast.
2. A single unified product for field users enabling data analytics.
3. The whole features are supported by intuitive web UI.

Features
------------------
Metatron Discovery is a data discovery web application which supports end-to-end features from data management to analytics.

Metatron provides:
- Interactive dashboarding with various types of charts.
- SQL based data exploration.
- Data source creation from your local, existing DBs, HIVE, or Kafka streams.
- Monitoring for job logs and data sources.
- Metadata management.
- GUI based data wrangling.
- Connections with advanced data analytics tools like [Apache Zeppelin](https://zeppelin.apache.org/).
- Administrations for users and workspaces for high ganularity security model.
- [Metatron distributed Druid](https://metatron.app/index.php/2018/06/15/skt-druid-features/) allows for metatron not only staying blazing-fast while slicing and dicing large, but also overcoming Druid weaknesses.

Screenshots
------------------
### Create Dashboards
<kbd><img title="Dashboard" src="https://user-images.githubusercontent.com/6300003/44020367-a32bf09a-9f1c-11e8-9915-f62a789b3d07.png"></kbd><br />

### Create Charts
<kbd><img title="Chart" src="https://user-images.githubusercontent.com/6300003/44201180-98bb4e80-a183-11e8-81da-54dd59d14330.png"></kbd><br />

### Map Analysis
<kbd><img title="Map" src="https://metatron.app/wp-content/uploads/2018/10/map.png"></kbd><br />

### Use Datasources
<kbd><img title="Use-Datasource" src="https://user-images.githubusercontent.com/6300003/44200744-51808e00-a182-11e8-8fc6-d30d56b4ab26.png"></kbd><br />

### Manage Datasources
<kbd><img title="Datasource-detail" src="https://user-images.githubusercontent.com/6300003/44200028-95729380-a180-11e8-95fb-070d7ed0d260.png"></kbd><br />

### Connect Database
<kbd><img title="Create-connection" src="https://user-images.githubusercontent.com/6300003/44200666-1bdba500-a182-11e8-8b2b-43dfdfe30bf4.png"></kbd><br />

### Prepare Origin Data
<kbd><img title="Data-preparation" src="https://user-images.githubusercontent.com/6300003/44019798-d02e8348-9f1a-11e8-958e-4e95802bd5de.png"></kbd><br />

### Query Monitoring
<kbd><img title="query-monitoring" src="https://metatron.app/wp-content/uploads/2018/10/screencapture-discovery-metatron-app-app-v2-management-monitoring-statistics-2018-10-29-15_38_15-1.png"><br /></kbd>

Installation
----------------------------
### Requirements
- MacOS / Linux (Redhat, CentOS)
- JDK 1.8
- [Druid customized version for Metatron](https://sktmetatronkrsouthshared.blob.core.windows.net/metatron-public/discovery-dist/latest/druid-0.9.1-latest-hadoop-2.7.3-bin.tar.gz)
- Apache Maven 3.3+ for building the project

### Install the Customized Druid
[Here is the link for downloading the archive.](https://sktmetatronkrsouthshared.blob.core.windows.net/metatron-public/discovery-dist/latest/druid-0.9.1-latest-hadoop-2.7.3-bin.tar.gz)

To install the Metatron distributed Druid, simply untar the downloaded archive. And start | stop the druid with the following commands.
<pre><code> $ start-single.sh | stop-single.sh </code></pre>

### (Optional) Install the GEO server
We introduced map view since 3.1.0.
If you want to using this feature, download [this archive](https://sktmetatronkrsouthshared.blob.core.windows.net/metatron-public/discovery-dist/latest/geoserver-metatron-latest.tar.gz) and run the geo server with the following commands.
<pre><code> $ bin/startup.sh | bin/shutdown.sh </code></pre>

### Build from source
Git clone this project.
<pre><code>$ git clone https://github.com/metatron-app/metatron-discovery.git</code></pre>
Build through Maven 3.3+.
<pre><code>$ mvn clean install -DskipTests</code></pre>
Buidling the whole project takes some time especially for the "discovery-frontend". Please wait a few minutes.

If the build succeeds, you can find an archive file under "discovery-distribution/target"

### Start up the Metatron Discovery
Untar the archive binary file of Metatron Discovery.
<pre><code>$ tar zxf metatron-discovery-{VERSION}-{TIMESTAMP}-bin.tar.gz</code></pre>
Initialize and run with the following command.
<pre><code>$ bin/metatron.sh --init start</code></pre>
> :warning: Cautions! `--init` option initialize whole data.  
> Add this argument only the first time or when you want to reset your development environment.

Running options are provided as well.
<pre><code>$ bin/metatron.sh [--config=directory] [--init] [--management] [--debug=port] {start|stop|restart|status}</code></pre>
To access Metatron Discovery, go to [http://localhost:8180](http://localhost:8180). (The default admin user account is provided as ID: admin, PW: admin.)


Problems & Suggestions
----------------------------
This project welcomes contributions and suggestions. If you encounter any bugs or want to request new features, feel free to open an [GitHub Issue](https://github.com/metatron-app/metatron-discovery) in the repo so that the community can find resolutions for it. Although, please check before you raise an issue. That is, please make sure someone else hasn’t already created an issue for the same topic.

Question
----------------------------
Need help using Metatron Discovery? Ask away on our [Metatron Discovery User Group](https://groups.google.com/forum/#!forum/metatron-discovery)! Our fellow community member or our engineers will be glad to help you out! Or maybe you might want to check out our user manual on our website as well.

License
----------------------------
Metatron Discovery is available under the Apache License V2.
