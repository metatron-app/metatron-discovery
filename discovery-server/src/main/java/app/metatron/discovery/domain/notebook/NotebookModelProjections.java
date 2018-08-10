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

import java.util.List;

import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by james on 2017. 7. 13..
 */
public class NotebookModelProjections {

    @Projection(name = "default", types = {NotebookModel.class})
    public interface DefaultProjection {

        String getId();

        String getName();

        String getDescription();

        NotebookModel.StatusType getStatusType();

        NotebookModel.SubscribeType getSubscribeType();

        List<NotebookModelHistory> getHistories();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();
    }

    @Projection(name = "forListView", types = {NotebookModel.class})
    public interface ListViewProjection {

        String getId();

        String getName();

        String getDescription();

        NotebookModel.StatusType getStatusType();

        NotebookModel.SubscribeType getSubscribeType();

        @Value("#{target.getNotebookPath()}")
        String getNotebookPath();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();

        DateTime getModifiedTime();
    }

    @Projection(name = "forSummaryListView", types = {NotebookModel.class})
    public interface SummaryListViewProjection {

        String getId();

        String getName();

        String getDescription();
    }

    @Projection(name = "forDetailView", types = {NotebookModel.class})
    public interface DetailViewProjection {

        String getId();

        String getName();

        String getDescription();

        NotebookModel.StatusType getStatusType();

        NotebookModel.SubscribeType getSubscribeType();

        List<NotebookModelHistory> getHistories();

        Notebook getNotebook();

        @Value("#{target.getNotebookPath()}")
        String getNotebookPath();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();
    }

    @Projection(name = "forHistoryListView", types = {NotebookModel.class})
    public interface HistoryListViewProjection {

        List<NotebookModelHistory> getHistories();

    }

}
