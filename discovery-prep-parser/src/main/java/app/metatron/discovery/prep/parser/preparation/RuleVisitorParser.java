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

package app.metatron.discovery.prep.parser.preparation;

import app.metatron.discovery.prep.parser.antlr.RuleBaseVisitor;
import app.metatron.discovery.prep.parser.antlr.RuleLexer;
import app.metatron.discovery.prep.parser.antlr.RuleParser;
import app.metatron.discovery.prep.parser.exceptions.FunctionInvalidFunctionNameException;
import app.metatron.discovery.prep.parser.preparation.rule.Arguments;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.RuleBuilder;

import app.metatron.discovery.prep.parser.preparation.rule.expr.*;
import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.tree.TerminalNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toList;

public class RuleVisitorParser implements Parser {

  private static final Logger LOGGER = LoggerFactory.getLogger(RuleVisitorParser.class);

  private static final Map<String, Supplier<Function>> functions = Maps.newHashMap();

  static {
    register(BuiltinFunctions.class);
  }

  public static void register(Class parent) {
    for (Class clazz : parent.getClasses()) {
      if (!Modifier.isAbstract(clazz.getModifiers()) && Function.class.isAssignableFrom(clazz)) {
        try {
          Function function = (Function) clazz.newInstance();
          String name = function.name().toLowerCase();
          if (functions.containsKey(name)) {
            throw new IllegalArgumentException("function '" + name + "' should not be overridden");
          }
          Supplier<Function> supplier = function instanceof Function.Factory ? (Function.Factory) function
              : Suppliers.ofInstance(function);
          functions.put(name, supplier);
          if (parent != BuiltinFunctions.class) {
            LOGGER.debug("user defined function '" + name + "' is registered with class " + clazz.getName());
          }
        } catch (Exception e) {
          LOGGER.warn("Failed to instantiate " + clazz.getName() + ".. ignoring");
        }
      } else if ( clazz.isInterface())
        register(clazz);
    }
  }

  @Override
  public Rule parse(String code) {
    //code = code.replaceAll("\\\\", "\\\\\\\\");
    CharStream charStream = new ANTLRInputStream(code);
    RuleLexer lexer = new RuleLexer(charStream);
    TokenStream tokens = new CommonTokenStream(lexer);
    RuleParser parser = new RuleParser(tokens);

    RuleSetVisitor ruleSetVisitor = new RuleSetVisitor();
    Rule traverseResult = ruleSetVisitor.visit(parser.ruleset());
    return traverseResult;
  }

  private static class RuleSetVisitor extends RuleBaseVisitor<Rule> {

    public Rule visitRuleset(RuleParser.RulesetContext ctx) {
      String ruleName = ctx.RULE_NAME().getText();
      ArgsVisitor argsVisitor = new ArgsVisitor();
      List<Arguments> args = ctx.args()
          .stream()
          .map(arg -> arg.accept(argsVisitor))
          .collect(toList());
      return new RuleBuilder(ruleName, args).build();
    }

  }

  private static class ArgsVisitor extends RuleBaseVisitor<Arguments> {

    public Arguments visitArgs(RuleParser.ArgsContext ctx) {

      String argName = ctx.ARG_NAME().getText();

      ExpressionVisitor expressionVisitor = new ExpressionVisitor();

      Expression expr = ctx.expr().accept(expressionVisitor);

      return new Arguments(argName, expr);
    }
  }

  private static class ExpressionVisitor extends RuleBaseVisitor<Expression> {

    @Override
    public Expression visitIdentifierExpr(RuleParser.IdentifierExprContext ctx) {
      if (ctx.getText().equals("null"))
        return new Null.NullExpr(ctx.getText());
      else
        return new Identifier.IdentifierExpr(ctx.getText());
    }

    @Override
    public Expression visitNullExpr(RuleParser.NullExprContext ctx) {
      return new Null.NullExpr(ctx.getText());
    }

    @Override
    public Expression visitStringExpr(RuleParser.StringExprContext ctx) {
      return new Constant.StringExpr(ctx.getText());
    }

    @Override
    public Expression visitRegularExpr(RuleParser.RegularExprContext ctx) {
      return new RegularExpr(ctx.getText());
    }

    @Override
    public Expression visitDoubleExpr(RuleParser.DoubleExprContext ctx) {
      return new Constant.DoubleExpr(Double.valueOf(ctx.getText()));
    }

    @Override
    public Expression visitLongExpr(RuleParser.LongExprContext ctx) {
      return new Constant.LongExpr(Long.valueOf(ctx.getText()));
    }

    @Override
    public Expression visitBooleanExpr(RuleParser.BooleanExprContext ctx) {
      return new Constant.BooleanExpr(Boolean.valueOf(ctx.getText()));
    }

    @Override
    public Expression visitIdentifierArrayExpr(RuleParser.IdentifierArrayExprContext ctx) {
      return new Identifier.IdentifierArrayExpr(ctx.IDENTIFIER().stream()
          .map(terminalNode -> terminalNode.getText())
          .collect(toList()));
    }

    @Override
    public Expression visitDoubleArrayExpr(RuleParser.DoubleArrayExprContext ctx) {
      return new Constant.ArrayExpr<>(ctx.DOUBLE().stream()
          .map(terminalNode -> Double.valueOf(terminalNode.getText()))
          .collect(toList()));
    }

    @Override
    public Expression visitLongArrayExpr(RuleParser.LongArrayExprContext ctx) {
      return new Constant.ArrayExpr<>(ctx.LONG().stream()
          .map(terminalNode -> Long.valueOf(terminalNode.getText()))
          .collect(toList()));
    }

    @Override
    public Expression visitStringArrayExpr(RuleParser.StringArrayExprContext ctx) {
      return new Constant.ArrayExpr<>(ctx.STRING().stream()
          .map(terminalNode -> terminalNode.getText())
          .collect(toList()));
    }

    @Override
    public Expression visitFn(RuleParser.FnContext ctx) {
      Function func = getFunctionByName(ctx.IDENTIFIER().toString());

      FunctionArgsVisitor functionArgsVisitor = new FunctionArgsVisitor();

      List<Expr> exprs = null;
      if(ctx.fnArgs() != null) {
        exprs = ctx.fnArgs().accept(functionArgsVisitor);
      } else {
        exprs = Lists.newArrayList();
      }

      if (func == null)
        throw new FunctionInvalidFunctionNameException(ctx.getStart().getText() + " is not supported function.");
      return new Expr.FunctionExpr(func, func.name(), exprs);
    }

    @Override
    public Expression visitFunctionExpr(RuleParser.FunctionExprContext ctx) {
      return visitFn(ctx.fn());
    }

    @Override
    public Expression visitFunctionArrayExpr(RuleParser.FunctionArrayExprContext ctx) {
      return new Expr.FunctionArrayExpr(ctx.fn().stream()
          .map(fnContext -> (Expr.FunctionExpr) visitFn(fnContext))
          .collect(toList()));
    }

    @Override
    public Expression visitLogicalOpExpr(RuleParser.LogicalOpExprContext ctx) {

      int opCode = ((TerminalNode) ctx.getChild(1)).getSymbol().getType();
      switch (opCode) {
        case RuleParser.LT:

          return new Expr.BinLtExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.LEQ:
          return new Expr.BinLeqExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.GT:
          return new Expr.BinGtExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.GEQ:
          return new Expr.BinGeqExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.EQ:
          return new Expr.BinEqExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.NEQ:
          return new Expr.BinNeqExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.ASSIGN:
          return new Expr.BinAsExpr(
                  ctx.getChild(1).getText(),
                  (Expr) ctx.getChild(0).accept(this),
                  (Expr) ctx.getChild(2).accept(this)
          );
        default:
          throw new RuntimeException("Unrecognized binary operator " + ctx.getChild(1).getText());
      }
    }

    @Override
    public Expression visitAddSubExpr(RuleParser.AddSubExprContext ctx) {
      int opCode = ((TerminalNode) ctx.getChild(1)).getSymbol().getType();
      switch (opCode) {
        case RuleParser.PLUS:
          return new Expr.BinPlusExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.MINUS:
          return new Expr.BinMinusExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        default:
          throw new RuntimeException("Unrecognized binary operator " + ctx.getChild(1).getText());
      }
    }

    @Override
    public Expression visitLogicalAndOrExpr(RuleParser.LogicalAndOrExprContext ctx) {
      int opCode = ((TerminalNode) ctx.getChild(1)).getSymbol().getType();
      switch (opCode) {
        case RuleParser.AND:
          return new Expr.BinAndExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.OR:
          return new Expr.BinOrExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        default:
          throw new RuntimeException("Unrecognized binary operator " + ctx.getChild(1).getText());
      }
    }

    @Override
    public Expression visitNestedExpr(RuleParser.NestedExprContext ctx) {
      return ctx.getChild(1).accept(this);
    }

    @Override
    public Expression visitUnaryOpExpr(RuleParser.UnaryOpExprContext ctx) {
      int opCode = ((TerminalNode) ctx.getChild(0)).getSymbol().getType();
      switch (opCode) {
        case RuleParser.MINUS:
          Expr.UnaryMinusExpr tmp = new Expr.UnaryMinusExpr((Expr) ctx.getChild(1).accept(this));
          if (tmp.toString().contains("."))
            return new Constant.DoubleExpr(Double.valueOf(ctx.getText()));
          else
            return new Constant.LongExpr(Long.valueOf(ctx.getText()));
        case RuleParser.NOT:
          return new Expr.UnaryNotExpr((Expr) ctx.getChild(1).accept(this));
        default:
          throw new RuntimeException("Unrecognized unary operator " + ctx.getChild(0).getText());
      }
    }

    @Override
    public Expression visitLogicalAndOrExpr2(RuleParser.LogicalAndOrExpr2Context ctx) {

      int opCode = ((TerminalNode) ctx.getChild(1)).getSymbol().getType();
      switch (opCode) {
        case RuleParser.AND:
          return new Expr.BinAndExpr2(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.OR:
          return new Expr.BinOrExpr2(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        default:
          throw new RuntimeException("Unrecognized binary operator " + ctx.getChild(1).getText());
      }
    }

    @Override
    public Expression visitMulDivModuloExpr(RuleParser.MulDivModuloExprContext ctx) {
      int opCode = ((TerminalNode) ctx.getChild(1)).getSymbol().getType();
      switch (opCode) {
        case RuleParser.MUL:
          return new Expr.BinMulExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.DIV:
          return new Expr.BinDivExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        case RuleParser.MODULO:
          return new Expr.BinModuloExpr(
              ctx.getChild(1).getText(),
              (Expr) ctx.getChild(0).accept(this),
              (Expr) ctx.getChild(2).accept(this)
          );
        default:
          throw new RuntimeException("Unrecognized binary operator " + ctx.getChild(1).getText());
      }
    }

    @Override
    public Expression visitPowOpExpr(RuleParser.PowOpExprContext ctx) {
      return new Expr.BinPowExpr(
          ctx.getChild(1).getText(),
          (Expr) ctx.getChild(0).accept(this),
          (Expr) ctx.getChild(2).accept(this)
      );
    }

    @Override
    public Expression visitAssignExpr(RuleParser.AssignExprContext ctx) {
      return new Expr.AssignExpr(
          (Expr) ctx.getChild(0).accept(this),
          (Expr) ctx.getChild(2).accept(this)
      );
    }

    private Function getFunctionByName(String name) {
      String lowerName = name.toLowerCase();
      if (functions.containsKey(lowerName)) {
        return functions.get(lowerName).get();
      } else {
        new RuntimeException("Not supported function(" + name + ").");
      }

      return null;
    }
  }

  private static class FunctionArgsVisitor extends RuleBaseVisitor<List<Expr>> {

    @Override
    public List<Expr> visitFunctionArgs(RuleParser.FunctionArgsContext ctx) {
      ExpressionVisitor visitor = new ExpressionVisitor();
      return ctx.expr().stream()
          .map(exprContext -> (Expr) exprContext.accept(visitor))
          .collect(toList());
    }
  }
}
