import { statement, htmlStatement, Play } from "../src/statement";

const plays: { [key: string]: Play } = {
  henry: { name: "Henry V", type: "history" },
  arcadia: { name: "Arcadia", type: "pastoral" },
};

const invoiceFor = (...performances: { playID: string; audience: number }[]) => ({
  customer: "TestCo",
  performances,
});

describe("history", () => {
  test("観客25人以下は基本料金 $350", () => {
    const result = statement(invoiceFor({ playID: "henry", audience: 20 }), plays);
    expect(result).toContain("Henry V: $350.00 (20 seats)");
  });

  test("観客25人ちょうどは加算なし（境界値）", () => {
    const result = statement(invoiceFor({ playID: "henry", audience: 25 }), plays);
    expect(result).toContain("Henry V: $350.00 (25 seats)");
  });

  test("観客26人から1人 $8 加算（境界値）", () => {
    const result = statement(invoiceFor({ playID: "henry", audience: 26 }), plays);
    expect(result).toContain("Henry V: $358.00 (26 seats)");
  });

  test("観客40人なら $470", () => {
    const result = statement(invoiceFor({ playID: "henry", audience: 40 }), plays);
    expect(result).toContain("Henry V: $470.00 (40 seats)");
  });

  test("ポイント：30人以下は10人ごとのボーナスのみ", () => {
    const result = statement(invoiceFor({ playID: "henry", audience: 20 }), plays);
    expect(result).toContain("You earned 2 credits");
  });

  test("ポイント：30人超えは基本ルール＋10人ごとのボーナス", () => {
    const result = statement(invoiceFor({ playID: "henry", audience: 40 }), plays);
    expect(result).toContain("You earned 14 credits");
  });
});

describe("pastoral", () => {
  test("基本 $200 ＋ 1人 $4", () => {
    const result = statement(invoiceFor({ playID: "arcadia", audience: 30 }), plays);
    expect(result).toContain("Arcadia: $320.00 (30 seats)");
  });

  test("ちょうど上限 $600 になる人数（境界値）", () => {
    const result = statement(invoiceFor({ playID: "arcadia", audience: 100 }), plays);
    expect(result).toContain("Arcadia: $600.00 (100 seats)");
  });

  test("上限を超える人数でも $600 で止まる", () => {
    const result = statement(invoiceFor({ playID: "arcadia", audience: 120 }), plays);
    expect(result).toContain("Arcadia: $600.00 (120 seats)");
  });

  test("ポイント：3人ごとに1（基本ルールは使わない）", () => {
    const result = statement(invoiceFor({ playID: "arcadia", audience: 30 }), plays);
    expect(result).toContain("You earned 10 credits");
  });

  test("ポイント：30人超えでも基本ルールは加算されない", () => {
    const result = statement(invoiceFor({ playID: "arcadia", audience: 120 }), plays);
    expect(result).toContain("You earned 40 credits");
  });
});

describe("複数公演", () => {
  test("history と pastoral の合計", () => {
    const result = statement(
      invoiceFor({ playID: "henry", audience: 40 }, { playID: "arcadia", audience: 30 }),
      plays,
    );
    expect(result).toContain("Amount owed is $790.00");
    expect(result).toContain("You earned 24 credits");
  });
});

describe("htmlStatement", () => {
  test("公演ごとに表の行が出力される", () => {
    const result = htmlStatement(
      invoiceFor({ playID: "henry", audience: 40 }, { playID: "arcadia", audience: 30 }),
      plays,
    );
    expect(result).toContain("<h1>Statement for TestCo</h1>");
    expect(result).toContain("<tr><td>Henry V</td><td>40</td><td>$470.00</td></tr>");
    expect(result).toContain("<tr><td>Arcadia</td><td>30</td><td>$320.00</td></tr>");
    expect(result).toContain("<p>Amount owed is <em>$790.00</em></p>");
    expect(result).toContain("<p>You earned <em>24</em> credits</p>");
  });
});

describe("未知の種類", () => {
  test("エラーになる", () => {
    const unknownPlays = { x: { name: "Mystery", type: "musical" } };
    expect(() => statement(invoiceFor({ playID: "x", audience: 10 }), unknownPlays)).toThrow(
      "unknown type: musical",
    );
  });
});