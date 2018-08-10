--
-- 기본 테이블
CREATE TABLE sample_ingestion(
  time STRING,
  d STRING,
  sd STRING,
  m1 DOUBLE,
  m2 DOUBLE
)
row format delimited fields terminated by ',' stored as textfile;
LOAD DATA INPATH '/tmp/sample_ingestion.csv' OVERWRITE INTO TABLE sample_ingestion;
--
-- 기본 테이블
CREATE TABLE sample_ingestion_types(
  time STRING,
  d STRING,
  sd STRING,
  m1 bigint,
  m2 int,
  m3 decimal(5,2)
)
row format delimited fields terminated by ',' stored as textfile;
LOAD DATA INPATH '/tmp/sample_ingestion_types.csv' OVERWRITE INTO TABLE sample_ingestion_types;
--
-- partition 기초 테이블
CREATE TABLE sample_ingestion_partition(
  time DATE,
  d STRING,
  sd STRING,
  m1 DOUBLE,
  m2 DOUBLE
)
partitioned by (ym STRING, dd STRING)
row format delimited fields terminated by ',' stored as textfile;
LOAD DATA INPATH '/tmp/sample_ingestion_parition.csv' OVERWRITE INTO TABLE sample_ingestion_partition PARTITION (ym='201704', dd='20');
--
-- ORC 파일 변환 Sample
CREATE TABLE sample_ingestion_orc
STORED AS ORC
TBLPROPERTIES("orc.compress"="snappy")
AS SELECT * FROM sample_ingestion;

-- PARQUET 파일 변환 Sample
CREATE TABLE sample_ingestion_parquet
STORED AS PARQUET
TBLPROPERTIES("orc.compress"="snappy")
AS SELECT * FROM sample_ingestion;