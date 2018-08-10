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

package app.metatron.discovery.common;

import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by james on 2017. 7. 20..
 */
public class SparkSubmitCommandBuilder extends AbstractCommandBuilder {

    static final String SPARK_SUBMIT = "spark-submit";
    static final String SPARK_MASTER = "--master";
    static final String SPARK_DEPLOY_MODE = "--deploy-mode";
    static final String SPARK_DRIVER_MEMORY = "--driver-memory";
    static final String SPARK_EXECUTOR_MEMORY = "--executor-memory";
    static final String SPARK_EXECUTOR_CORES = "--executor-cores";
    static final String SPARK_NUM_EXECUTORS = "--num-executors";
    static final String SPARK_QUEUE = "--queue";

    String home;
    String master;
    String deployMode;
    String driverMemory;
    String executorMemory;
    String numExecutors;
    String executorCores;
    String queue;
    String execute;

    public SparkSubmitCommandBuilder() {
    }

    public String getHome() {
        return home;
    }

    public void setHome(String home) {
        this.home = home;
    }

    public String getMaster() {
        return master;
    }

    public void setMaster(String master) {
        this.master = master;
    }

    public String getDeployMode() {
        return deployMode;
    }

    public void setDeployMode(String deployMode) {
        this.deployMode = deployMode;
    }

    public String getDriverMemory() {
        return driverMemory;
    }

    public void setDriverMemory(String driverMemory) {
        this.driverMemory = driverMemory;
    }

    public String getExecutorMemory() {
        return executorMemory;
    }

    public void setExecutorMemory(String executorMemory) {
        this.executorMemory = executorMemory;
    }

    public String getNumExecutors() {
        return numExecutors;
    }

    public void setNumExecutors(String numExecutors) {
        this.numExecutors = numExecutors;
    }

    public String getExecutorCores() {
        return executorCores;
    }

    public void setExecutorCores(String executorCores) {
        this.executorCores = executorCores;
    }

    public String getQueue() {
        return queue;
    }

    public void setQueue(String queue) {
        this.queue = queue;
    }

    public String getExecute() {
        return execute;
    }

    public void setExecute(String execute) {
        this.execute = execute;
    }

    /**
     *
     */
    private void buildCommand() {
        List<String> appArgs = new ArrayList<>();
        appArgs.add(this.home + SPARK_SUBMIT);
        appArgs.add(SPARK_MASTER);
        appArgs.add(this.master);
        appArgs.add(SPARK_DEPLOY_MODE);
        appArgs.add(this.deployMode);
        applyOption(appArgs);
        appArgs.add(this.execute);
        super.commandArgs = appArgs;
    }

    /**
     *
     * @param appArgs
     */
    private List<String> applyOption(List<String> appArgs) {
        if(!StringUtils.isEmpty(this.driverMemory)){
            appArgs.add(SPARK_DRIVER_MEMORY);
            appArgs.add(this.driverMemory);
        } else if(!StringUtils.isEmpty(this.executorMemory)) {
            appArgs.add(SPARK_EXECUTOR_MEMORY);
            appArgs.add(this.executorMemory);
        } else if(!StringUtils.isEmpty(this.executorCores)) {
            appArgs.add(SPARK_EXECUTOR_CORES);
            appArgs.add(this.executorCores);
        } else if(!StringUtils.isEmpty(this.numExecutors)) {
            appArgs.add(SPARK_NUM_EXECUTORS);
            appArgs.add(this.numExecutors);
        } else if(!StringUtils.isEmpty(this.queue)) {
            appArgs.add(SPARK_QUEUE);
            appArgs.add(this.queue);
        }
        return appArgs;
    }

    /**
     *
     * @throws IOException
     * @throws InterruptedException
     */
    public void run() throws Exception {
        buildCommand();
        super.run();
    }

    /**
     *
     * @return
     * @throws IOException
     */
    public String runRedirectOutput() throws Exception {
        buildCommand();
        return super.runRedirectOutput();
    }

}
