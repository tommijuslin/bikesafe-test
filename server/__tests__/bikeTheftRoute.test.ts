import { app } from '../src/app'
import supertest from 'supertest'
import { sequelize } from '../src/util/db'
import { BikeTheft } from '../src/models/bikeTheft'
import { Coordinate } from '../src/models/coordinate'
import { migrator } from '../src/util/db'

const api = supertest(app)

const initialCoordinates = [
    {
        lat: 50,
        lng: 60
    },
    {
        lat: 10,
        lng: 20
    }
]

beforeAll(async () => {
    await migrator.up()
})

beforeEach(async () => {
    const coordinates = await Coordinate.bulkCreate(initialCoordinates)
    const bikeThefts = [
        {coordinateId: coordinates[0].id},
        {coordinateId: coordinates[1].id}
    ]
    await BikeTheft.bulkCreate(bikeThefts)
})

afterEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true })
})

describe("GET /api/bike_thefts", () => {
    test('Bike_thefts are returned as json', async () => {
        await api
          .get('/api/bike_thefts')
          .expect(200)
          .expect('Content-Type', /application\/json/)
    })

    test('Bike_thefts are returned in correct format.', async () => {
        const response = await api.get('/api/bike_thefts').expect(200)
        const bike_theft = response.body[0]
        console.log(bike_theft)
        expect(bike_theft.id).toBe(1)
        expect(bike_theft.coordinateId).toBe(1)
        expect(bike_theft.coordinate).toEqual({id: 1, lat: 50, lng:60})
        
    })

    test("Returns correct amount of bike_thefts.", async () => {
        const response = await api.get("/api/bike_thefts").expect(200)

        expect(response.body).toHaveLength(initialCoordinates.length)
    })

})

describe("POST /api/bike_thefts", () => {
    test('Bike_theft is added to database.', async () => {
        
        const newCoordinate = {
            lat: 69,
            lng: 55
        }
        
        await api
            .post("/api/bike_thefts")
            .send(newCoordinate)
            .expect(201)

        const bikeTheftResponse = await api
            .get("/api/bike_thefts")
            .expect(200)

        expect(bikeTheftResponse.body).toHaveLength(initialCoordinates.length + 1)
    })

    test("Posting bike theft with invalid coordinate responds with error", async () => {
        const newCoordinate = {
            lat: 69
        }

        await api
            .post("/api/bike_thefts")
            .send(newCoordinate)
            .expect(400)
    })

    test("Invalid bike theft is not added to database", async () => {
        const newCoordinate = {
            lat: "Latitude that is not a number",
            lng: "Longitude that is not a number"
        }

        await api
            .post("/api/bike_thefts")
            .send(newCoordinate)
            .expect(400)

        const response = await api
            .get("/api/bike_thefts")
            .expect(200)

        expect(response.body).toHaveLength(initialCoordinates.length)
    })
})

afterAll(async () => {
    await sequelize.close()
})