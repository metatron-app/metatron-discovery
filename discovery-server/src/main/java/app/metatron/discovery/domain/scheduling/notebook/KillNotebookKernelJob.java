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

package app.metatron.discovery.domain.scheduling.notebook;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Trigger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.notebook.NotebookConnectorRepository;
import app.metatron.discovery.domain.notebook.connector.HttpRepository;

import static org.springframework.beans.factory.config.BeanDefinition.SCOPE_PROTOTYPE;

/**
 * Created by james on 2017. 9. 18..
 */
@Component
@Scope(SCOPE_PROTOTYPE)
@Transactional
@DisallowConcurrentExecution
public class KillNotebookKernelJob extends QuartzJobBean {

    private static Logger LOGGER = LoggerFactory.getLogger(KillNotebookKernelJob.class);

    @Autowired
    NotebookConnectorRepository notebookConnectorRepository;

    @Autowired
    HttpRepository httpRepository;

    @Override
    protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

        Trigger trigger = jobExecutionContext.getTrigger();
        Page<NotebookConnector> connectors = notebookConnectorRepository.findByType("jupyter", new PageRequest(0, Integer.MAX_VALUE));
        if(connectors.getTotalElements() == 0) {
            LOGGER.warn("Job({}) - No notebook[jupyter] servers found.", trigger.getKey().getName());
            return;
        }
        for(NotebookConnector connector : connectors) {
            connector.setHttpRepository(httpRepository);
            connector.killAllKernels();
        }
        LOGGER.warn("Job({}) - Successfully killed all of notebook kernels.", trigger.getKey().getName());
    }
}
