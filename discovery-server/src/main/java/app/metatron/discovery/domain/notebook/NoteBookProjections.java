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

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 11. 2..
 */
public class NoteBookProjections {

    @Projection(name = "default", types = {Notebook.class})
    public interface DefaultProjection {

        String getId();

        String getName();

        String getType();

        String getDescription();

        String getFolderId();

        Notebook.DSType getDsType();

        String getDsId();

        String getDsName();

        Notebook.KernelType getKernelType();

        NotebookAPI getNotebookAPI();

//    Set<NotebookModel> getModels();

        @Value("#{target.getLink()}")
        String getLink();

        @Value("#{target.getConnector().getType()}")
        String getConnectorType();

        NotebookConnector getConnector();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();

        DateTime getModifiedTime();
    }

    @Projection(name = "forListView", types = {Notebook.class})
    public interface ListViewProjection {

        String getId();

        String getName();

        String getType();

        String getDescription();

        String getFolderId();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();
    }

    @Projection(name = "forDetailView", types = {Notebook.class})
    public interface DetailViewProjection {

        String getId();

        String getName();

        String getType();

        String getDescription();

        String getFolderId();

        Notebook.DSType getDsType();

        String getDsId();

        String getDsName();

        Notebook.KernelType getKernelType();

        NotebookAPI getNotebookAPI();

//    Set<NotebookModel> getModels();

        @Value("#{target.getLink()}")
        String getLink();

        @Value("#{target.getConnector().getType()}")
        String getConnectorType();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();

        DateTime getModifiedTime();
    }

    @Projection(name = "forAPIView", types = {Notebook.class})
    public interface APIViewProjection {

        NotebookAPI getNotebookAPI();

    }

}
