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

package app.metatron.discovery.domain.notebook;

import org.springframework.stereotype.Component;

import app.metatron.discovery.domain.notebook.connector.JupyterBuilder;

/**
 * Created by james on 2017. 7. 16..
 */
@Component
public class NotebookModelService implements NotebookModelAction {

// TODO. replace in-memory data grid
// private static final Map<String, String> viewerMap = Maps.newHashMap();

//    @Autowired
//    MetatronProperties metatronProperties;

    @Override
    public String execute(NotebookModel model) {
//        try {
////            if(viewerMap.containsKey(model.id)) {
////                return viewerMap.get(model.id);
////            } else {
//                if(model.getNotebook() == null) {
//                    throw new RuntimeException("Notebook does not exist related to this model.");
//                } else {
//                    String sparkPath = metatronProperties.getNotebook().getSparkDir();
//                    JupyterBuilder builder;
//                    if (Notebook.KernelType.R.equals(model.getNotebook().getKernelType())) {
//                        builder = new RBuilder(sparkPath);
//                    } else if (Notebook.KernelType.PYTHON.equals(model.getNotebook().getKernelType())) {    // PYTHON
//                        builder = new Py3Builder(sparkPath);
//                    } else {
//                        throw new RuntimeException("Not exists or unsupported kernel type.");
//                    }
//                    // viewerMap.put(model.id, viewer);
//                    return generate(model, builder);
//                }
////            }
//        } catch (Exception e) {
//            throw new RuntimeException("Fail to generate view.");
//        }
        return null;
    }

    /**
     * generate output after model execution
     *
     * @param model
     * @param builder
     * @return
     * @throws Exception
     */
    private String generate(NotebookModel model, JupyterBuilder builder) throws Exception {
//        String viewer;
//        if (NotebookModel.SubscribeType.HTML.equals(model.getSubscribeType())) {
//            viewer = builder.generateHTML(model);
//        } else if (NotebookModel.SubscribeType.JSON.equals(model.getSubscribeType())){
//            viewer = builder.generateJSON(model);
//        } else {
//            throw new RuntimeException("Not exists or unsupported subscribe type.");
//        }
//        return viewer;
        return null;
    }

    @Override
    public void deleteCachedViewer(String modelId) {
//        if(viewerMap.containsKey(modelId)) {
//            viewerMap.remove(modelId);
//        }
    }
}
