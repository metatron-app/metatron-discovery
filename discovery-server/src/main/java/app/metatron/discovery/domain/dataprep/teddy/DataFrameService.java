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

import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.*;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformExecutionInterrupteddException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformTimeoutException;

@Service
public class DataFrameService {
  private static Logger LOGGER = LoggerFactory.getLogger(DataFrame.class);

  @Value("${polaris.dataprep.sampling.cores:0}")
  private int cores;

  static final int hardRowLimit = 100 * 10000;

  static private List<String> getLiteralList(Expression expr) {
    List<String> literals = null;
    if (expr instanceof Constant.StringExpr) {
      literals = new ArrayList<>();
      literals.add(((Constant.StringExpr) expr).getEscapedValue());
    } else if (expr instanceof Constant.ArrayExpr) {
      literals = ((Constant.ArrayExpr) expr).getValue();
      for (int i = 0; i < literals.size(); i++) {
        literals.set(i, literals.get(i).replaceAll("'", ""));
      }
    } else {
      assert false : expr;
    }
    return literals;
  }

  static public List<String> getSlaveDsIds(String ruleString) {
    Rule rule;

    try {
      rule = new RuleVisitorParser().parse(ruleString);
    } catch (RuleException re) {
      LOGGER.error("getSlaveDsIds(): Rule exception occurred", re);
      throw PrepException.fromTeddyException(TeddyException.fromRuleException(re));
    }

    switch (rule.getName()) {
      case "join":
        return getLiteralList(((Join) rule).getDataset2());
      case "union":
        return getLiteralList(((Union) rule).getDataset2());
      default:
        return null;
    }
  }

  public DataFrame applyRule(DataFrame df, String ruleString, List<DataFrame> slaveDfs,
                             int limitRows, int timeout) throws TeddyException {
    LOGGER.trace("applyRule(): start");

    // single thread
    if (cores == 0) {
      LOGGER.trace("applyRule(): end (single)");
      return applyRuleInternal(df, ruleString, slaveDfs, limitRows);
    }
    else {
      List<Future<List<Row>>> futures = new ArrayList<>();
      Rule rule = new RuleVisitorParser().parse(ruleString);
      DataFrame newDf = DataFrame.getNewDf(rule, df.dsName, ruleString);

      try {
        LOGGER.debug("applyRule(): start: ruleString={}", ruleString);
        List<Object> preparedArgs = newDf.prepare(df, rule, slaveDfs);
        int rowcnt = df.rows.size();

        if (rowcnt > 0) {
          if (DataFrame.isParallelizable(rule)) {
            int partSize = rowcnt / cores + 1;  // +1 to prevent being 0

            for (int rowno = 0; rowno < rowcnt; rowno += partSize) {
              LOGGER.debug("applyRuleString(): add thread: rowno={} partSize={} rowcnt={}", rowno, partSize, rowcnt);
              futures.add(gatherAsync(df, newDf, preparedArgs, rowno, Math.min(partSize, rowcnt - rowno), hardRowLimit));
            }

            for (int i = 0; i < futures.size(); i++) {
              List<Row> rows = futures.get(i).get(timeout, TimeUnit.SECONDS);
              assert rows != null : rule.toString();
              newDf.rows.addAll(rows);
            }
          } else {
            // if not parallelizable, newDf comes to be modified directly.
            // then, 'rows' returned is only for assertion.
            List<Row> rows = newDf.gather(df, preparedArgs, 0, rowcnt, hardRowLimit);
            assert rows == null : ruleString;
          }
        }
      }
      catch (ExecutionException e) {
        String msg = "loadContentsByRule(): transform execution failed";
        LOGGER.error(msg, e);
        throw new TransformExecutionFailedException(msg);
      }
      catch (InterruptedException e) {
        String msg = "loadContentsByRule(): transform execution interrupted";
        LOGGER.error(msg, e);
        throw new TransformExecutionInterrupteddException(msg);
      }
      catch (TimeoutException e) {
        String msg = String.format("loadContentsByRule(): transform timeout: timeout=%ds", timeout);
        LOGGER.error(msg, e);
        throw new TransformTimeoutException(msg);
      }

      LOGGER.trace("applyRule(): end (parallel)");
      return newDf;
    }
  }

  @Async("threadPoolTaskExecutor")
  public Future<DataFrame> applyRuleAsync(DataFrame df, String ruleString, List<DataFrame> slaveDfs, int limitRows) throws TeddyException {
    return new AsyncResult<>(applyRuleInternal(df, ruleString, slaveDfs, limitRows));
  }

//  // slaveDf: only for join. union cannot be parallelized
//  public DataFrame applyRuleParallel(DataFrame df, String ruleString, DataFrame slaveDf, int limitRows) throws TeddyException {
//    DfMove dfMove = new DfMove(df.dsName, ruleString);
//    Rule rule;
//
//    assert cores > 0;
//
//    try {
//      rule = new RuleVisitorParser().parse(ruleString);
//    } catch (RuleException re) {
//      LOGGER.error("applyRule(): rule syntax error: ", re);
//      throw PrepException.fromTeddyException(TeddyException.fromRuleException(re));
//    }
//
//    List<Integer> targetOrder = dfMove.prepare(df, (Move) rule);
//
//    int rowcnt = df.rows.size();
//    if (rowcnt == 0) {
//      return dfMove;
//    }
//
//    // +--------+-------+----------+-------------------------------+
//    // | rowCnt | cores | partSize | ranges                        |
//    // +--------+-------+----------+-------------------------------+
//    // |      1 |     4 |        1 | (0, 1)                        |
//    // |      2 |     4 |        1 | (0, 2) (1, 1)                 |
//    // |      3 |     4 |        1 | (0, 3) (1, 1) (2, 1)          |
//    // |      4 |     4 |        1 | (0, 4) (1, 1) (2, 1) (3, 1)   |
//    // |      5 |     4 |        2 | (0, 2) (2, 2) (4, 1)          |
//    // |      6 |     4 |        2 | (0, 2) (2, 2) (4, 2)          |
//    // |      7 |     4 |        2 | (0, 2) (2, 2) (4, 2) (6, 1)   |
//    // |      8 |     4 |        2 | (0, 2) (2, 2) (4, 1) (6, 2)   |
//    // |      9 |     4 |        3 | (0, 3) (3, 3) (6, 3)          |
//    // |     10 |     4 |        3 | (0, 3) (3, 3) (6, 3) (9, 1)   |
//    // |     11 |     4 |        3 | (0, 3) (3, 3) (6, 3) (9, 2)   |
//    // |     12 |     4 |        3 | (0, 3) (3, 3) (6, 3) (9, 3)   |
//    // |     13 |     4 |        4 | (0, 4) (4, 4) (8, 4) (12, 1)  |
//    // |     14 |     4 |        4 | (0, 4) (4, 4) (8, 4) (12, 2)  |
//    // |     15 |     4 |        4 | (0, 4) (4, 4) (8, 4) (12, 3)  |
//    // |     16 |     4 |        4 | (0, 4) (4, 4) (8, 4) (12, 4)  |
//    // |     17 |     4 |        5 | (0, 5) (5, 5) (10, 5) (15, 2) |
//    // |     18 |     4 |        5 | (0, 5) (5, 5) (10, 5) (15, 3) |
//    // |     19 |     4 |        5 | (0, 5) (5, 5) (10, 5) (15, 4) |
//    // |     20 |     4 |        5 | (0, 5) (5, 5) (10, 5) (15, 5) |
//    // |     21 |     4 |        6 | (0, 6) (6, 6) (12, 6) (18, 3) |
//    // |     22 |     4 |        6 | (0, 6) (6, 6) (12, 6) (18, 4) |
//    // |     23 |     4 |        6 | (0, 6) (6, 6) (12, 6) (18, 5) |
//    // |     24 |     4 |        6 | (0, 6) (6, 6) (12, 6) (18, 6) |
//    // |     25 |     4 |        7 | (0, 7) (7, 7) (14, 7) (21, 4) |
//    // |     26 |     4 |        7 | (0, 7) (7, 7) (14, 7) (21, 5) |
//    // |     27 |     4 |        7 | (0, 7) (7, 7) (14, 7) (21, 6) |
//    // |     28 |     4 |        7 | (0, 7) (7, 7) (14, 7) (21, 7) |
//    // +--------+-------+----------+-------------------------------+
//
//    int partSize = rowcnt / cores + 1;
//    List<Future<ArrayList<Row>>> futures = new ArrayList<>();
//    for (int rowno = 0; rowno < rowcnt; rowno += partSize) {
//      futures.add(gatherAsync(df, dfMove, rowno, Math.min(partSize, rowcnt - rowno), targetOrder));
//    }
//
//    try {
//      for (int i = 0; i < futures.size(); i++) {
//        List<Row> part = futures.get(i).get();
//        dfMove.rows.addAll(part);
//      }
//    } catch (InterruptedException e) {
//      e.printStackTrace();
//    } catch (ExecutionException e) {
//      e.printStackTrace();
//    }
//
//    return dfMove;
//  }

  @Async("threadPoolTaskExecutor")
  public Future<List<Row>> gatherAsync(DataFrame prevDf, DataFrame newDf, List<Object> preparedArgs,
                                       int offset, int length, int limit) throws TeddyException, InterruptedException {
    return new AsyncResult<>(newDf.gather(prevDf, preparedArgs, offset, length, limit));
  }

  // public for tests
  public DataFrame applyRuleInternal(DataFrame df, String ruleString, List<DataFrame> slaveDfs, int limitRows) throws TeddyException {
    DataFrame newDf;
    Rule rule;

    LOGGER.trace("applyRuleInternal(): start");

    try {
      rule = new RuleVisitorParser().parse(ruleString);
    } catch (RuleException re) {
      LOGGER.error("applyRule(): rule syntax error: ", re);
      throw PrepException.fromTeddyException(TeddyException.fromRuleException(re));
    }

    switch (rule.getName()) {
      // 내용이 손실되지 않는 룰
      case "move":          newDf = df.doMove((Move) rule); break;
      case "sort":          newDf = df.doSort((Sort) rule); break;
      case "union":
        newDf = df.union(slaveDfs, limitRows);
        break;

      // 컬럼 단위로 삭제가 일어나지만, 남은 컬럼의 내용은 그대로인 경우
      case "drop":          newDf = df.doDrop((Drop) rule); break;

      // 행 단위로 삭제가 일어나지만, 남은 행의 내용은 그대로인 경우
      case "keep":          newDf = df.doKeep((Keep) rule); break;
      case "delete":        newDf = df.doDelete((Delete) rule); break;

      // 1개 컬럼이 영향을 받는 경우
      case "flatten":       newDf = df.doFlatten((Flatten) rule, limitRows); break;

      // 여러 컬럼이 영향을 받는 경우
      case "header":        newDf = df.doHeader((Header) rule); break;
      case "rename":        newDf = df.doRename((Rename) rule); break;
      case "replace":
        newDf = df.doReplace((Replace) rule, ruleString); // $col을 치환하고 재파싱함
        break;
      case "settype":       newDf = df.doSetType((SetType) rule); break;
      case "setformat":     newDf = df.doSetFormat((SetFormat) rule); break;
      case "set":
        newDf = df.doSet((Set) rule, ruleString);  // $col을 치환하고 재파싱함
        break;

      // 새로 column이 1개 생기는 경우
      case "countpattern":  newDf = df.doCountPattern((CountPattern) rule); break;
      case "derive":        newDf = df.doDerive((Derive) rule); break;
      case "merge":         newDf = df.doMerge((Merge) rule); break;
      case "unnest":        newDf = df.doUnnest((Unnest) rule); break;
      case "extract":       newDf = df.doExtract((Extract) rule); break;
      case "aggregate":     newDf = df.doAggregate((Aggregate) rule); break;

      // 새로 column이 여려개 생기는 경우
      case "split":         newDf = df.doSplit((Split) rule); break;
      case "nest":          newDf = df.doNest((Nest) rule); break;
      case "pivot":         newDf = df.doPivot((Pivot) rule); break;     // TODO: 최대 컬럼 개수 UI에서 받아서 처리해야 함
      case "unpivot":       newDf = df.doUnpivot((Unpivot) rule); break; // FIXME: sampleRows까지 cut
      case "join":
        assert slaveDfs.size() == 1 : slaveDfs.size();
        newDf = df.doJoin((Join) rule, slaveDfs.get(0), limitRows);
        break;

      default:
        LOGGER.error("applyRule(): rule not supported: " + rule.getName());
        throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_RULE_NOT_SUPPORTED);
    }

    LOGGER.trace("applyRuleInternal(): end");

    newDf.ruleString = ruleString;
    return newDf;
  }
}
