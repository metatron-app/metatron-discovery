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

package app.metatron.discovery.domain.notebook.connector;

import com.fasterxml.jackson.databind.ObjectMapper;

import app.metatron.discovery.domain.notebook.Notebook;

/**
 * Created by james on 2017. 7. 31..
 */
public interface JupyterAction {

    Object createCells(Notebook notebook);

    Object createMetaData(ObjectMapper mapper);

//    String generateHTML(NotebookModel model) throws Exception;
//
//    String generateJSON(NotebookModel model) throws Exception;

    String generateHTML(Notebook notebook) throws Exception;

    String generateJSON(Notebook notebook) throws Exception;

}
