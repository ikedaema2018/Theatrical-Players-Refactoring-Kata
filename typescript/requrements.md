# 金額
| 種類 | 悲劇 | 喜劇
| 基準 | 40000 | 30000
| 何人以上ならextra? | 30 | 20
| いくら？ | 1000 * (audience - 30) | 10000 + 500 * (audience - 20)
| 他には? | なし | 300 * audience |

# Credit
| どっちも | Math.max(perf.audience - 30, 0) | * |
| extra | - | Math.floor(perf.audience / 5)

# result
## per performance
```
 ${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    } seats)\n
```
## last
```
Amount owed is ${format(totalAmount / 100)}\n
You earned ${volumeCredits} credits\n
```
