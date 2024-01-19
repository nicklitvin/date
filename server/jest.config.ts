import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    setupFilesAfterEnv: ["./jest.setup.ts"]
};

export default config;