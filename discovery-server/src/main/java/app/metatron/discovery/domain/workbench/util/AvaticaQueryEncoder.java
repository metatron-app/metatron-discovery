package app.metatron.discovery.domain.workbench.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class AvaticaQueryEncoder {
  private static Logger LOGGER = LoggerFactory.getLogger(AvaticaQueryEncoder.class);

  public static String encode(final String query) {
    try {
      char[] chars = query.toCharArray();
      List<Integer> output = new ArrayList<>();
      for (int i = 0; i < chars.length; i++) {
        int c = Character.codePointAt(chars, i);
        if (c < 0x7F) {
          output.add(c);
        } else if (c < 0x7FF) {
          output.add(0xC0 + (c >> 6));
          output.add(0x80 + (c & 0x3F));
        } else if (c < 0xFFFF) {
          output.add(0xE0 + (c >> 12));
          output.add(0x80 + ((c >> 6) & 0x3F));
          output.add(0x80 + (c & 0x3F));
        } else if (c < 0x10FFFF) {
          output.add(0xF0 + (c >> 18));
          output.add(0x80 + ((c >> 6) & 0x3F));
          output.add(0x80 + ((c >> 12) & 0x3F));
          output.add(0x80 + (c & 0x3F));
        }
      }
      int[] codePoints = output.stream().mapToInt(i -> i).toArray();
      return new String(codePoints, 0, codePoints.length);
    } catch(Exception e) {
      LOGGER.error("error query encoding", e);
      return query;
    }
  }

}
