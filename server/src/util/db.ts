import { Sequelize } from 'sequelize-typescript'
import { DATABASE_URL } from './config'
import { Coordinate } from '../models/coordinate'
import { BikeTheft } from '../models/bikeTheft'
import { LockStation } from '../models/lockStation'
import { Umzug, SequelizeStorage } from 'umzug'

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env')
}

export const sequelize = new Sequelize(DATABASE_URL, {
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
  if (process.env.NODE_ENV !== 'test') {
    const migrations = await migrator.up()
    console.log('Migrations up to date', {
      migrations,
    })
  }
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