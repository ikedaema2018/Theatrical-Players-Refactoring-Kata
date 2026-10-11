type Plays = {
  [key: string]: {
    name: string;
    type: string;
  };
};

type Performance = {
  playID: string;
  audience: number;
};

type Invoice = {
  customer: string;
  performances: Performance[];
};
export type Play = {
  name: string;
  type: string;
}

type EnrichedPerformance = Performance & {
  play: Play;
  amount: number;
  volumeCredits: number;
};

type StatementData = {
  customer: string;
  performances: EnrichedPerformance[];
  totalAmount: number;
  totalVolumeCredits: number;
}

abstract class PerformanceCalculator {
  constructor(protected performance: Performance) {}

  abstract get amount(): number;
  public get volumeCredits(): number {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount(): number {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount(): number {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  public get volumeCredits(): number {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}

class HistoryCalculator extends PerformanceCalculator {
  get amount(): number {
    let result = 35000;
    if (this.performance.audience > 25) {
      result += 800 * (this.performance.audience - 25);
    }
    return result;
  }

  public get volumeCredits(): number {
    return super.volumeCredits + Math.floor(this.performance.audience / 10);
  }
}

class PastoralCalculator extends PerformanceCalculator {
  get amount(): number {
    let result = 20000;
    result += 400 * this.performance.audience;
    return Math.min(result, 60000);
  }

  public get volumeCredits(): number {
    return Math.floor(this.performance.audience / 3);
  }
}

function createPerformanceCalculator(performance: Performance, play: Play): PerformanceCalculator {
  switch (play.type) {
    case "tragedy":
      return new TragedyCalculator(performance);
    case "comedy":
      return new ComedyCalculator(performance);
    case "history":
      return new HistoryCalculator(performance);
    case "pastoral":
      return new PastoralCalculator(performance);
    default:
      throw new Error(`unknown type: ${play.type}`);
  }
}

function createStatementData(invoice: Invoice, plays: Plays): StatementData {
  const performances = invoice.performances.map(perf => {
    const play = plays[perf.playID];
    const calculator = createPerformanceCalculator(perf, play);
    return {
      ...perf,
      play: play,
      amount: calculator.amount,
      volumeCredits: calculator.volumeCredits
    };
  });
  const statementData: StatementData = {
    customer: invoice.customer,
    performances: performances,
    totalAmount: performances.reduce((total, perf) => total + perf.amount, 0),
    totalVolumeCredits: performances.reduce((total, perf) => total + perf.volumeCredits, 0)
  };
  return statementData;
}

function usd(amountInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

function renderPlainText(statement: StatementData) {
  let result = `Statement for ${statement.customer}\n`;
  for (let perf of statement.performances) {
    // print line for this order
    result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience} seats)\n`;
  }
  result += `Amount owed is ${usd(statement.totalAmount)}\n`;
  result += `You earned ${statement.totalVolumeCredits} credits\n`;
  return result;
}

function renderHtml(data: StatementData) {
  let result = `<h1>Statement for ${data.customer}</h1>\n`;
  result += "<table>\n";
  result += "<tr><th>play</th><th>seats</th><th>cost</th></tr>\n";
  for (const perf of data.performances) {
    result += `<tr><td>${perf.play.name}</td><td>${perf.audience}</td>`;
    result += `<td>${usd(perf.amount)}</td></tr>\n`;
  }
  result += "</table>\n";
  result += `<p>Amount owed is <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>You earned <em>${data.totalVolumeCredits}</em> credits</p>\n`;
  return result;
}

function statement(invoice: Invoice, plays: Plays) {
  const statementData: StatementData = createStatementData(invoice, plays);
  return renderPlainText(statementData);
}

function htmlStatement(invoice: Invoice, plays: Plays) {
  const statementData: StatementData = createStatementData(invoice, plays);
  return renderHtml(statementData);
}

export { statement, htmlStatement };




