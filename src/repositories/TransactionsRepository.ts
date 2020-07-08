import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionWithCategory {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: Category;
  created_at: Date;
  updated_at: Date;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(transaction.value);
            break;

          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;

          default:
            break;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }

  async findAllTransactionsWithCategories(): Promise<
    TransactionWithCategory[]
  > {
    const transactions = await this.find({ relations: ['category'] });

    return transactions.map(transaction => ({
      id: transaction.id,
      title: transaction.title,
      value: Number(transaction.value),
      type: transaction.type,
      category: {
        id: transaction.category.id,
        title: transaction.category.title,
        created_at: transaction.category.created_at,
        updated_at: transaction.category.updated_at,
      },
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }));
  }
}

export default TransactionsRepository;
