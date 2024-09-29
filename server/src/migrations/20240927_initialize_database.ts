import { DataTypes } from 'sequelize'
import { Migration } from '../util/db'

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.createTable('coordinates', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      lng: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
    })

    await queryInterface.createTable('bike_thefts', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      coordinate_id: {
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'coordinates',
          },
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
    })

    await queryInterface.createTable('lock_stations', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      coordinate_id: {
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'coordinates',
          },
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
    })
  }

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('bike_thefts')
  await queryInterface.dropTable('lock_stations')
  await queryInterface.dropTable('coordinates')
}