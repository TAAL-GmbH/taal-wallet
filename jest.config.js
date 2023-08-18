/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const fs = require('fs');
const { parse } = require('comment-json');
const tsconfig = parse(fs.readFileSync('./tsconfig.json').toString());
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

module.exports = {
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'jsdom',
  verbose: true,
  modulePathIgnorePatterns: ['dist'],
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
  moduleNameMapper,
  setupFilesAfterEnv: ['./config/jest/jest.setup.js'],
};
