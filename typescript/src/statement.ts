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

type EnrichedPerformance = Performance & {
  play: {
    name: string;
    type: string;
  };
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

function createPerformanceCalculator(performance: Performance, play: { name: string; type: string }): PerformanceCalculator {
  switch (play.type) {
    case "tragedy":
      return new TragedyCalculator(performance);
    case "comedy":
      return new ComedyCalculator(performance);
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

function statement(invoice: Invoice, plays: Plays) {
  const statementData: StatementData = createStatementData(invoice, plays);
  return renderPlainText(statementData);
}

export { statement };




