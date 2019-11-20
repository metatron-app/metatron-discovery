/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.etl.TeddyOrcWriter;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import java.io.File;
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.junit.BeforeClass;
import org.junit.Test;

public class OrcTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("sample", "teddy/sample.csv");
  }

  @Test
  public void test_rename_settype() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"));
    df = prepare_sample(df);
    df.show();
  }

  @Test
  public void test_rename() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"));
    df = prepare_sample(df);
    df.show();

    String ruleString = "rename col: speed to: 'speed_new'";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_writeOrc() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"));
    df = prepare_sample(df);
    df.show();

    Configuration conf = new Configuration();
    String hadoopConfDir = "Users/jhkim/opt/hadoop/etc/hadoop";
    conf.addResource(new Path(hadoopConfDir + File.separator + "core-site.xml"));
    conf.addResource(new Path(hadoopConfDir + File.separator + "hdfs-site.xml"));

    Path file = new Path("/tmp/test_dataprep/orc4/test_writeOrc.orc");

    FileSystem fs = FileSystem.get(conf);
    fs.delete(file, true);

    TeddyOrcWriter orcWriter = new TeddyOrcWriter();
    orcWriter.writeOrc(df, conf, file, PrSnapshot.HIVE_FILE_COMPRESSION.SNAPPY);
  }
}
