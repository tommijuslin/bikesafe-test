import { app } from '../src/index'
import supertest from 'supertest'
import { sequelize } from '../src/util/db'
import { LockStation } from '../src/models/lockStation'
import { Coordinate } from '../src/models/coordinate'
import { migrator } from '../src/util/db'

const api = supertest(app)

const initialCoordinates = [
    {
        lat: 40,
        lng: 60
    },
    {
        lat: 15,
        lng: 20
    }
]

beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    await migrator.up()
    const coordinates = await Coordinate.bulkCreate(initialCoordinates)
    const lockStations = [
        {coordinateId: coordinates[0].id},
        {coordinateId: coordinates[1].id}
    ]
    await LockStation.bulkCreate(lockStations)
})

describe("GET /api/lock_stations", () => {
    test('LockStations are returned as json', async () => {
        await api
          .get('/api/lock_stations')
          .expect(200)
          .expect('Content-Type', /application\/json/)
    })
    test('LockStations are returned in correct format.', async () => {
        const response = await api.get('/api/lock_stations').expect(200)
        const lockStation = response.body[0]
        console.log(lockStation)
        
        expect(lockStation.id).toBe(1)
        expect(lockStation.coordinateId).toBe(1)
        expect(lockStation.coordinate).toEqual({id: 1, lat: 40, lng:60})
        
    })

    test("Returns correct amount of lockStations.", async () => {
        const response = await api.get("/api/lock_stations").expect(200)

        expect(response.body).toHaveLength(initialCoordinates.length)
    })
})

describe("POST /api/lock_stations", () => {
    test('LockStation is added to database.', async () => {
        
        const newCoordinate = {
            lat: 69,
            lng: 55
        }
        await api
            .post("/api/lock_stations")
            .send(newCoordinate)
            .expect(201)

        const lockStationResponse = await api
            .get("/api/lock_stations")
            .expect(200)

        expect(lockStationResponse.body).toHaveLength(initialCoordinates.length + 1)
    })
    test("Posting lockStation with invalid coordinate responds with error", async () => {
        const newCoordinate = {
            lat: 69
        }

        await api
            .post("/api/lock_stations")
            .send(newCoordinate)
            .expect(400)
    })

    test("Invalid lockStation is not added to database", async () => {
        const newCoordinate = {
            lat: "Latitude that is not a number",
            lng: "Longitude that is not a number"
        }

        await api
            .post("/api/lock_stations")
            .send(newCoordinate)
            .expect(400)

        const response = await api
            .get("/api/lock_stations")
            .expect(200)

        expect(response.body).toHaveLength(initialCoordinates.length)
    })
})

afterAll(async () => {
    await sequelize.close()
})