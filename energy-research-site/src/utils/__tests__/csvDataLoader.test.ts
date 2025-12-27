import { CSVDataLoader } from '../csvDataLoader'

// Mock Papa Parse
const mockPapa = {
  parse: jest.fn(),
}

jest.mock('papaparse', () => mockPapa)

describe('CSVDataLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadCSV', () => {
    it('should load and parse CSV data successfully', async () => {
      const mockData = [
        {
          benchmark: 'matrix_multiply.cpp',
          iteration: 1,
          total_iterations: 50,
          avg_cpu_power_W: 25.5,
          total_cpu_energy_J: 45.2,
          avg_gpu_power_W: 2.1,
          runtime_ms: 1500,
          bench_start_ts: 1234567890,
          bench_start_path: 'path/to/start',
          generated_path: 'gen_path',
          live_profile_file: 'profile.csv',
          result_ids: '[]',
        },
      ]

      mockPapa.parse.mockImplementation((_input, options) => {
        setTimeout(() => {
          if (options?.complete) {
            // eslint-disable-next-line no-extra-semi
            ;(options.complete as (results: Papa.ParseResult<unknown>) => void)({
              data: mockData,
              errors: [],
              meta: {
                fields: Object.keys(mockData[0]),
                delimiter: ',',
                linebreak: '\n',
                aborted: false,
                truncated: false,
                cursor: 0,
              },
            })
          }
        }, 0)
        return {} as Papa.ParseResult<unknown>
      })

      const testFile = new File(['test,data'], 'test.csv', { type: 'text/csv' })
      const result = await CSVDataLoader.loadCSV(testFile)

      expect(result).toEqual(mockData)
      expect(mockPapa.parse).toHaveBeenCalledWith(testFile, expect.any(Object))
    })
  })

  describe('processData', () => {
    it('should process raw CSV data into ProcessedBenchmarkData format', () => {
      const rawData = [
        {
          benchmark: 'matrix_multiply.cpp',
          iteration: 1,
          total_iterations: 50,
          avg_cpu_power_W: 25.5,
          total_cpu_energy_J: 45.2,
          avg_gpu_power_W: 2.1,
          runtime_ms: 1500,
          bench_start_ts: 1234567890,
          bench_start_path: 'path/to/start',
          generated_path: 'gen_path',
          live_profile_file: 'profile.csv',
          result_ids: '[]',
        },
      ]

      const result = CSVDataLoader.processData(rawData)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        language: 'C++',
        benchmark: 'matrix_multiply',
        iteration: 1,
        totalIterations: 50,
        avgCpuPowerW: 25.5,
        totalCpuEnergyJ: 45.2,
        avgGpuPowerW: 2.1,
        runtimeMs: 1500,
        totalEnergyJ: 45.2,
        jPerFlop: expect.any(Number),
        timestamp: expect.any(Date),
        runId: expect.any(String),
      })
    })
  })
})
