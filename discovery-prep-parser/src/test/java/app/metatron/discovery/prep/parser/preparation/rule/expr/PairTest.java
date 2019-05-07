package app.metatron.discovery.prep.parser.preparation.rule.expr;

import org.junit.Assert;
import org.junit.Test;

import java.util.Comparator;

public class PairTest {

    @Test
    public void testOf() {
        Pair pair = new Pair("lhs", "rhs");
        Pair pair2 = new Pair("foo", "bar");
        Assert.assertEquals(pair2, pair.of("foo", "bar"));
    }

    @Test
    public void testEquals() {
        Pair pair = new Pair("lhs", "rhs");
        Assert.assertTrue(pair.equals(pair));
        Assert.assertTrue(pair.equals(new Pair("lhs", "rhs")));

        Assert.assertFalse(pair.equals(null));
        Assert.assertFalse(pair.equals(new Pair(null, "rhs")));
        Assert.assertFalse(pair.equals(new Pair("lhs", null)));
    }

    @Test
    public void testHashCode() {
        Pair pair = new Pair("lhs", "rhs");
        Assert.assertEquals(3433830, pair.hashCode());
    }

    @Test
    public void testToString() {
        Pair pair = new Pair("lhs", "rhs");
        Assert.assertEquals("Pair{lhs=lhs, rhs=rhs}", pair.toString());
    }

    @Test
    public void testLhsFn() {
        Pair pair = new Pair("lhs", "rhs");
        Assert.assertEquals("foo", pair.lhsFn().apply(new Pair<>("foo", "bar")));
    }

    @Test
    public void testRhsFn() {
        Pair pair = new Pair("lhs", "rhs");
        Assert.assertEquals("bar", pair.rhsFn().apply(new Pair<>("foo", "bar")));
    }

    @Test
    public void testLhsComparator() {
        Comparator comp = new Comparator<String>() {
            @Override
            public int compare(String s, String t1) {
                if (s.equals(t1)) {
                    return 0;
                } else {
                    return 1;
                }
            }

            @Override
            public boolean equals(Object o) {
                return false;
            }
        };

        Pair pair = new Pair("lhs", "rhs");
        Pair compare1 = new Pair<>("foo", "bar");
        Pair compare2 = new Pair<>("baz", "baz");
        Assert.assertEquals(0, pair.lhsComparator(comp).compare(compare1, compare1));
        Assert.assertEquals(1, pair.lhsComparator(comp).compare(compare1, compare2));
    }
}
