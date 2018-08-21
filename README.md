Metatron Discovery
=========

<img title="logo-metatron" src="https://user-images.githubusercontent.com/6300003/44013820-f7647c96-9f02-11e8-8066-1c97f8b1662c.png" width="600px">

**Metatron discovery** is a self-service solution for big data discovery.
To learn more about metatron discovery, visit our web site [https://metatron.app](https://metatron.app)

Strengths
------------------
1. Powered by [Apache Druid](http://druid.io/), metatron can process huge size of data super fast.
2. A single unified product for field users enabling data analytics.
3. Intuitive web UI for creating dashboards with various types of charts. 

Features
------------------
Metatron discovery is a data discovery web application supports end-to-end features from data management to ananlytics.

Metatron provides:
- Interactive dashboards with 16 types of WSIWYG charts.
- SQL based data exploration.
- Connections with advanced analytics tools like [Apache Zeppline](https://zeppelin.apache.org/).
- Metadata management.
- Data source creation from local, existing DBs, HIVE, and Kafka streams.
- GUI based data preparation.
- Monitoring tools for logs, jobs, and lineages of datasets.
- Administrations for users and workspaces for high ganularity security model.
- [Customized Druid](https://metatron.app/index.php/2018/06/15/skt-druid-features/) allows for metatron not only staying blazing-fast while slicing and dicing large, but also overcoming Druid weaknesses.

Screenshots
------------------
### Create Dashboards
<kbd><img title="Dashboard" src="https://user-images.githubusercontent.com/6300003/44020367-a32bf09a-9f1c-11e8-9915-f62a789b3d07.png"></kbd><br />

### Create Charts
<kbd><img title="Chart" src="https://user-images.githubusercontent.com/6300003/44201180-98bb4e80-a183-11e8-81da-54dd59d14330.png"></kbd><br />

### Use Datasources
<kbd><img title="Use-Datasource" src="https://user-images.githubusercontent.com/6300003/44200744-51808e00-a182-11e8-8fc6-d30d56b4ab26.png"></kbd><br />

### Manage Datasources
<kbd><img title="Datasource-detail" src="https://user-images.githubusercontent.com/6300003/44200028-95729380-a180-11e8-95fb-070d7ed0d260.png"></kbd><br />

### Connect Database
<kbd><img title="Create-connection" src="https://user-images.githubusercontent.com/6300003/44200666-1bdba500-a182-11e8-8b2b-43dfdfe30bf4.png"></kbd><br />

### Prepare Origin Data
<kbd><img title="Data-preparation" src="https://user-images.githubusercontent.com/6300003/44019798-d02e8348-9f1a-11e8-958e-4e95802bd5de.png"></kbd><br />

Download & Installation
----------------------------
### Requirements
- MacOS / Linux (Redhat, CentOS)
- JDK 1.8
- Druid customized version for Metatron
- Apache Maven 3.3+ for building the project

### Install the Customized Druid
[Here is the link for downloading the binary.](https://sktmetatronkrsouthshared.blob.core.windows.net/metatron-public/discovery-dist/druid/druid-0.9.1-metatron-3.0.0-hadoop-2.7.3.tar.gz)
Start | stop the druid with the following commands.
<pre><code> $ start-single.sh | stop-single.sh </code></pre>

### Build the Metatron Discovery
Git clone this project.
<pre><code>$ git clone https://github.com/metatron-app/metatron-discovery.git</code></pre>
Build through Maven 3.3+.
<pre><code>$ mvn clean install -DskipTests</code></pre>

### Deploy & Run
Unzip the binary file of Metatron.
<pre><code>$ tar zxf metatron-discovery-{VERSION}-{TIMESTAMP}-bin.tar.gz</code></pre>
Initialize and run with the following command.
<pre><code>$ bin/metatron.sh --init start</code></pre>
Running options are provided as well.
<pre><code>$ bin/metatron.sh [--config=directory] [--init] [--management] [--debug=port] {start|stop|restart|status}</code></pre>
Check [http://localhost:8180](http://localhost:8180) for the Metatron Discovery server.

License
----------------------------
Metatron Discovery is available under the Apache License V2.

