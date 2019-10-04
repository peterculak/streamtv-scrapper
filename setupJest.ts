require('dotenv').config();
jest.setMock('node-fetch', require('jest-fetch-mock'));