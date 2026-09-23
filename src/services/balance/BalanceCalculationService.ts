import type { OverallSummary, Person, PersonBalanceSummary, Transaction } from '../../types';

/**
 * Service dedicated exclusively to debt and balance calculations (SOLID: SRP)
 * Pure functions with zero side effects.
 */
export class BalanceCalculationService {
  /**
   * Safely rounds currency numbers to 2 decimal places to avoid IEEE-754 precision issues
   */
  static round(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  /**
   * Computes the overall portfolio summary
   */
  static calculateOverallSummary(
    transactions: Transaction[],
    peopleCount: number
  ): OverallSummary {
    let totalYouAreOwed = 0;
    let totalYouOwe = 0;
    let activeCount = 0;
    let settledCount = 0;

    for (const tx of transactions) {
      if (tx.status === 'SETTLED' || tx.remainingAmount <= 0) {
        settledCount++;
      } else {
        activeCount++;
        if (tx.type === 'LENT') {
          totalYouAreOwed += tx.remainingAmount;
        } else if (tx.type === 'BORROWED') {
          totalYouOwe += tx.remainingAmount;
        }
      }
    }

    totalYouAreOwed = this.round(totalYouAreOwed);
    totalYouOwe = this.round(totalYouOwe);
    const netBalance = this.round(totalYouAreOwed - totalYouOwe);

    return {
      totalYouAreOwed,
      totalYouOwe,
      netBalance,
      activeCount,
      settledCount,
      peopleCount,
    };
  }

  /**
   * Computes balance summary for a specific person
   */
  static calculatePersonBalance(
    person: Person,
    transactions: Transaction[]
  ): PersonBalanceSummary {
    const personTxs = transactions.filter((tx) => tx.personId === person.id);
    let totalLent = 0;
    let totalBorrowed = 0;
    let activeCount = 0;
    let settledCount = 0;

    for (const tx of personTxs) {
      if (tx.status === 'SETTLED' || tx.remainingAmount <= 0) {
        settledCount++;
      } else {
        activeCount++;
        if (tx.type === 'LENT') {
          totalLent += tx.remainingAmount;
        } else if (tx.type === 'BORROWED') {
          totalBorrowed += tx.remainingAmount;
        }
      }
    }

    totalLent = this.round(totalLent);
    totalBorrowed = this.round(totalBorrowed);
    const netBalance = this.round(totalLent - totalBorrowed);

    return {
      person,
      totalLent,
      totalBorrowed,
      netBalance,
      activeCount,
      settledCount,
    };
  }

  /**
   * Computes balance summaries for all persons, sorted with active debts first
   */
  static calculateAllPersonBalances(
    persons: Person[],
    transactions: Transaction[]
  ): PersonBalanceSummary[] {
    const summaries = persons.map((person) =>
      this.calculatePersonBalance(person, transactions)
    );

    // Sort by absolute balance descending so significant debts appear on top
    return summaries.sort((a, b) => {
      const absA = Math.abs(a.netBalance);
      const absB = Math.abs(b.netBalance);
      if (absB !== absA) {
        return absB - absA;
      }
      return a.person.name.localeCompare(b.person.name);
    });
  }
}
