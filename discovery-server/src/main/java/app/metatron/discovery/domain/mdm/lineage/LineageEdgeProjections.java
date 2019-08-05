package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.common.BaseProjections;
import org.springframework.data.rest.core.config.Projection;

public class LineageEdgeProjections extends BaseProjections {
  @Projection(types = LineageEdge.class, name = "default")
  public interface DefaultProjection {
    String getEdgeId();
    String getFrMetaId();
    String getToMetaId();
    String getDesc();
  }

  @Projection(types = LineageEdge.class, name = "forListView")
  public interface ForListViewProjection {
    String getEdgeId();
    String getFrMetaId();
    String getToMetaId();
    String getDesc();
  }
}
