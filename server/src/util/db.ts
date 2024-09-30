import { Sequelize } from 'sequelize-typescript'
import { Coordinate } from '../models/coordinate'
import { BikeTheft } from '../models/bikeTheft'
import { LockStation } from '../models/lockStation'
import { Umzug, SequelizeStorage } from 'umzug'
import { DATABASE_URL, TEST_DATABASE_URL } from './config'


const databaseUrl = process.env.NODE_ENV === 'test'
  ? TEST_DATABASE_URL
  : DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL/TEST_DATABASE_URL is not defined in .env')
}

export const sequelize = new Sequelize(databaseUrl, {
  models: [Coordinate, BikeTheft, LockStation],
  logging: process.env.NODE_ENV !== 'test',
})

export const migrator = new Umzug({
  migrations: { glob: 'src/migrations/*.ts' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

export type Migration = typeof migrator._types.migration

const runMigrations = async () => {
    const migrations = await migrator.up()

    console.log('Migrations up to date', {
      migrations,
    })
}

export const connectToDatabase = async (): Promise<void | null> => {
  try {
    await sequelize.authenticate()
    await runMigrations()
    console.log('Connected to database')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }

  return null
}